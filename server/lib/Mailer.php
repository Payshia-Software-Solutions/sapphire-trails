<?php

require_once __DIR__ . '/../models/Mail.php';

class Mailer
{
    private $pdo;
    private $mailModel;
    private $settings;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
        $this->mailModel = new Mail($pdo);
        $this->settings = $this->mailModel->getSettings();
    }

    /**
     * Send an email via configured SMTP server
     */
    public function send($to, $subject, $htmlBody, $type = 'general', $altText = '', $cc = null, $bcc = null)
    {
        if (empty($this->settings['is_enabled'])) {
            $this->mailModel->logEmail($to, $subject, $type, 'failed', 'Mail system is disabled in settings', $htmlBody);
            return ['success' => false, 'error' => 'Mail system is disabled'];
        }

        $host       = $this->settings['smtp_host'];
        $port       = (int)$this->settings['smtp_port'];
        $encryption = strtolower($this->settings['smtp_encryption'] ?? 'ssl');
        $username   = $this->settings['smtp_username'];
        $password   = $this->settings['smtp_password'];
        $fromEmail  = $this->settings['from_email'];
        $fromName   = $this->settings['from_name'];

        try {
            $this->sendSmtp($host, $port, $encryption, $username, $password, $fromEmail, $fromName, $to, $subject, $htmlBody, $altText, $cc, $bcc);
            $this->mailModel->logEmail($to, $subject, $type, 'sent', null, $htmlBody);
            return ['success' => true];
        } catch (\Exception $e) {
            $errorMsg = $e->getMessage();
            error_log("Mailer error sending to $to: $errorMsg");
            $this->mailModel->logEmail($to, $subject, $type, 'failed', $errorMsg, $htmlBody);
            return ['success' => false, 'error' => $errorMsg];
        }
    }

    /**
     * Low-level RFC 5321 SMTP socket client with SSL/TLS support
     */
    private function sendSmtp($host, $port, $encryption, $username, $password, $fromEmail, $fromName, $to, $subject, $htmlBody, $altText = '', $cc = null, $bcc = null)
    {
        $timeout = 15;
        $socketHost = $host;
        if ($encryption === 'ssl') {
            $socketHost = "ssl://$host";
        }

        $context = stream_context_create([
            'ssl' => [
                'verify_peer'       => false,
                'verify_peer_name'  => false,
                'allow_self_signed' => true
            ]
        ]);

        $socket = @stream_socket_client("$socketHost:$port", $errno, $errstr, $timeout, STREAM_CLIENT_CONNECT, $context);
        if (!$socket) {
            throw new \Exception("Could not connect to SMTP host $host:$port ($errstr [$errno])");
        }

        stream_set_timeout($socket, $timeout);

        $this->readSmtpResponse($socket, 220);

        // Send EHLO
        $this->sendSmtpCommand($socket, "EHLO " . (gethostname() ?: 'localhost'), 250);

        // Handle STARTTLS if configured
        if ($encryption === 'tls') {
            $this->sendSmtpCommand($socket, "STARTTLS", 220);
            if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                throw new \Exception("Failed to establish TLS encryption with SMTP server");
            }
            $this->sendSmtpCommand($socket, "EHLO " . (gethostname() ?: 'localhost'), 250);
        }

        // Authenticate if username provided
        if (!empty($username)) {
            $this->sendSmtpCommand($socket, "AUTH LOGIN", 334);
            $this->sendSmtpCommand($socket, base64_encode($username), 334);
            $this->sendSmtpCommand($socket, base64_encode($password), 235);
        }

        // MAIL FROM
        $this->sendSmtpCommand($socket, "MAIL FROM:<$fromEmail>", 250);

        // Helper to extract and sanitize multiple emails (comma, semicolon, newline separated)
        $parseEmailList = function($raw) {
            if (empty($raw)) return [];
            if (is_array($raw)) {
                $raw = implode(',', $raw);
            }
            $normalized = str_replace([';', "\r", "\n"], ',', $raw);
            $parts = array_map('trim', explode(',', $normalized));
            $valid = [];
            foreach ($parts as $part) {
                if (!empty($part) && filter_var($part, FILTER_VALIDATE_EMAIL)) {
                    $valid[] = strtolower($part);
                }
            }
            return array_values(array_unique($valid));
        };

        $toEmails  = $parseEmailList($to);
        $ccEmails  = $parseEmailList($cc);
        $bccEmails = $parseEmailList($bcc);

        // Deliver to all TO, CC, and BCC recipients via SMTP RCPT TO
        $allRecipients = array_values(array_unique(array_merge($toEmails, $ccEmails, $bccEmails)));

        if (empty($allRecipients)) {
            throw new \Exception("No valid recipient email addresses found");
        }

        foreach ($allRecipients as $recipient) {
            $this->sendSmtpCommand($socket, "RCPT TO:<$recipient>", [250, 251]);
        }

        // DATA
        $this->sendSmtpCommand($socket, "DATA", 354);

        // Build Email Headers & Body
        $encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
        $encodedFromName = '=?UTF-8?B?' . base64_encode($fromName) . '?=';

        $boundary = "----=_NextPart_" . md5(uniqid(time(), true));

        $headers = [];
        $headers[] = "From: $encodedFromName <$fromEmail>";
        $headers[] = "To: " . implode(', ', $toEmails);
        if (!empty($ccEmails)) {
            $headers[] = "Cc: " . implode(', ', $ccEmails);
        }
        $headers[] = "Subject: $encodedSubject";
        $headers[] = "Date: " . date('r');
        $headers[] = "Message-ID: <" . md5(uniqid(time(), true)) . "@" . ($host ?: 'sapphiretrails.lk') . ">";
        $headers[] = "MIME-Version: 1.0";
        $headers[] = "Content-Type: multipart/alternative; boundary=\"$boundary\"";
        $headers[] = "X-Mailer: SapphireTrails PHP Mailer";

        $messageBody = implode("\r\n", $headers) . "\r\n\r\n";

        // Plaintext alternative
        $plainText = !empty($altText) ? $altText : strip_tags($htmlBody);
        $messageBody .= "--$boundary\r\n";
        $messageBody .= "Content-Type: text/plain; charset=UTF-8\r\n";
        $messageBody .= "Content-Transfer-Encoding: base64\r\n\r\n";
        $messageBody .= chunk_split(base64_encode($plainText)) . "\r\n";

        // HTML part
        $messageBody .= "--$boundary\r\n";
        $messageBody .= "Content-Type: text/html; charset=UTF-8\r\n";
        $messageBody .= "Content-Transfer-Encoding: base64\r\n\r\n";
        $messageBody .= chunk_split(base64_encode($htmlBody)) . "\r\n";

        $messageBody .= "--$boundary--\r\n";
        $messageBody .= ".\r\n";

        fputs($socket, $messageBody);
        $this->readSmtpResponse($socket, 250);

        // QUIT
        $this->sendSmtpCommand($socket, "QUIT", 221);
        fclose($socket);

        return true;
    }

    private function sendSmtpCommand($socket, $command, $expectedCode)
    {
        fputs($socket, $command . "\r\n");
        return $this->readSmtpResponse($socket, $expectedCode);
    }

    private function readSmtpResponse($socket, $expectedCode)
    {
        $response = '';
        while ($line = fgets($socket, 515)) {
            $response .= $line;
            if (substr($line, 3, 1) === ' ') {
                break;
            }
        }

        $code = (int)substr($response, 0, 3);
        $expectedCodes = is_array($expectedCode) ? $expectedCode : [$expectedCode];

        if (!in_array($code, $expectedCodes)) {
            throw new \Exception("SMTP Error ($code): " . trim($response));
        }

        return $response;
    }

    /**
     * Resolve image URL to absolute CDN HTTPS URL for email compatibility
     */
    private function resolveFullImageUrl($path)
    {
        if (empty($path)) {
            return 'https://content-provider.payshia.com/sapphire-trail/images/img4.webp';
        }
        if (preg_match('#^https?://#i', $path) || strpos($path, 'data:') === 0) {
            return $path;
        }
        $cleanBase = 'https://content-provider.payshia.com/sapphire-trail';
        $cleanPath = (strpos($path, '/') === 0) ? $path : ('/' . $path);
        return $cleanBase . $cleanPath;
    }

    /**
     * Send Customer & Admin Booking Emails
     */
    public function sendBookingEmails($booking, $tourPackage = null)
    {
        // Fallback: If tourPackage is not passed, fetch it directly
        if (!$tourPackage && !empty($booking['tour_package_id'])) {
            try {
                require_once __DIR__ . '/../models/TourPackage.php';
                $tpModel = new TourPackage($this->pdo);
                $tourPackage = $tpModel->getById($booking['tour_package_id']);
            } catch (\Exception $e) {
                error_log("Mailer could not auto-fetch tour package: " . $e->getMessage());
            }
        }

        $tourName = $tourPackage ? ($tourPackage['tour_page_title'] ?? $tourPackage['homepage_title'] ?? 'Tour Package') : ($booking['tour_title'] ?? 'Ratnapura Gem Tour');
        $rawTourImage = $tourPackage ? ($tourPackage['hero_image_url'] ?? $tourPackage['homepage_image_url'] ?? null) : ($booking['tour_image_url'] ?? null);
        $tourImage = $this->resolveFullImageUrl($rawTourImage);
        $tourDuration = $tourPackage['duration'] ?? '1 Day Expedition';

        $rawDate = $booking['tour_date'] ?? ($booking['date'] ?? null);
        $tourDate = !empty($rawDate) ? date('F d, Y', strtotime($rawDate)) : 'To be arranged';
        $guestName = $booking['name'] ?? 'Valued Guest';
        $guestEmail = $booking['email'] ?? '';
        $phone = $booking['phone'] ?? 'N/A';
        $guests = (int)($booking['guests'] ?? 1);
        $adults = (int)($booking['adults'] ?? $guests);
        $children = (int)($booking['children'] ?? 0);

        // Accurate Price Calculation
        $pricePerPerson = 0;
        if (!empty($tourPackage['price'])) {
            $pricePerPerson = (float)preg_replace('/[^0-9.]/', '', $tourPackage['price']);
        }
        if (isset($booking['total_price']) && (float)$booking['total_price'] > 0) {
            $totalPrice = (float)$booking['total_price'];
        } elseif (isset($booking['invoice_total']) && (float)$booking['invoice_total'] > 0) {
            $totalPrice = (float)$booking['invoice_total'];
        } elseif ($pricePerPerson > 0) {
            $totalPrice = $pricePerPerson * $guests;
        } else {
            $totalPrice = $guests * 120.00;
        }

        $bookingId = $booking['id'] ?? '';
        $specialRequests = $booking['message'] ?? null;

        // 1. Send Customer Confirmation Email
        if (!empty($guestEmail)) {
            $customerHtml = $this->renderCustomerBookingTemplate($bookingId, $guestName, $tourName, $tourDate, $guests, $adults, $children, $totalPrice, $tourImage, $tourDuration, $specialRequests);
            $this->send($guestEmail, "💎 Your Sapphire Trails Expedition Request Received (#$bookingId)", $customerHtml, 'booking_customer');
        }

        // 2. Send Admin Notification Email
        $adminEmails = $this->settings['admin_emails'];
        if (!empty($adminEmails)) {
            $adminHtml = $this->renderAdminBookingTemplate($bookingId, $guestName, $guestEmail, $phone, $tourName, $tourDate, $guests, $adults, $children, $totalPrice, $specialRequests, $tourImage, $tourDuration);
            $this->send($adminEmails, "🛎️ New Tour Booking Request #$bookingId - $guestName ($tourName)", $adminHtml, 'booking_admin', '', $this->settings['admin_emails_cc'], $this->settings['admin_emails_bcc']);
        }
    }

    /**
     * Send Customer & Admin Contact Inquiries
     */
    public function sendContactEmails($contact)
    {
        $name = $contact['name'] ?? 'Guest';
        $email = $contact['email'] ?? '';
        $phone = $contact['phone'] ?? 'N/A';
        $subject = !empty($contact['subject']) ? $contact['subject'] : 'General Inquiry';
        $message = $contact['message'] ?? '';
        $contactId = $contact['id'] ?? '';

        // 1. Send Customer Acknowledgement Email
        if (!empty($email)) {
            $customerHtml = $this->renderCustomerContactTemplate($name, $subject);
            $this->send($email, "Thank You for Contacting Sapphire Trails - $subject", $customerHtml, 'contact_customer');
        }

        // 2. Send Admin Notification Email
        $adminEmails = $this->settings['admin_emails'];
        if (!empty($adminEmails)) {
            $adminHtml = $this->renderAdminContactTemplate($contactId, $name, $email, $phone, $subject, $message);
            $this->send($adminEmails, "📩 New Website Inquiry #$contactId - $name: $subject", $adminHtml, 'contact_admin', '', $this->settings['admin_emails_cc'], $this->settings['admin_emails_bcc']);
        }
    }

    /**
     * Send Custom Proposal / Tour Inquiries
     */
    public function sendProposalEmails($proposal)
    {
        $name = $proposal['name'] ?? 'Guest';
        $email = $proposal['email'] ?? '';
        $phone = $proposal['phone'] ?? 'N/A';
        $tourInterest = $proposal['tour_interest'] ?? 'Bespoke Gem Tour Experience';
        $dates = $proposal['preferred_dates'] ?? 'Flexible';
        $partySize = $proposal['party_size'] ?? '1-2';
        $requirements = $proposal['special_requirements'] ?? 'N/A';

        // 1. Customer Email
        if (!empty($email)) {
            $customerHtml = $this->renderCustomerProposalTemplate($name, $tourInterest);
            $this->send($email, "Your Bespoke Tour Proposal Request - Sapphire Trails", $customerHtml, 'proposal_customer');
        }

        // 2. Admin Email
        $adminEmails = $this->settings['admin_emails'];
        if (!empty($adminEmails)) {
            $adminHtml = $this->renderAdminProposalTemplate($name, $email, $phone, $tourInterest, $dates, $partySize, $requirements);
            $this->send($adminEmails, "💎 New Bespoke Tour Proposal Inquiry - $name", $adminHtml, 'proposal_admin', '', $this->settings['admin_emails_cc'], $this->settings['admin_emails_bcc']);
        }
    }

    /**
     * Send Diagnostics Test Email
     */
    public function sendTestEmail($to)
    {
        $html = "
        <div style=\"background-color: #0f1115; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px 20px; color: #f8fafc;\">
          <div style=\"max-width: 580px; margin: 0 auto; background-color: #171923; border: 1px solid #2d3748; border-radius: 12px; padding: 32px;\">
            <div style=\"text-align: center; margin-bottom: 24px;\">
              <span style=\"font-size: 30px; letter-spacing: 0.1em; font-weight: bold; color: #c79954;\">SAPPHIRE TRAILS</span>
            </div>
            <h2 style=\"color: #ffffff; font-size: 22px; margin-bottom: 12px; text-align: center;\">SMTP Test Email Successful</h2>
            <p style=\"color: #94a3b8; font-size: 15px; line-height: 1.6;\">This is an automated test message from your Sapphire Trails PHP Mail Server. If you are receiving this, your SMTP connection settings, authentication, and encryption are functioning perfectly.</p>
            <div style=\"background-color: #0f1115; border: 1px solid #2d3748; border-radius: 8px; padding: 16px; margin: 24px 0; font-size: 13px; color: #cbd5e1;\">
              <div><strong>SMTP Host:</strong> {$this->settings['smtp_host']}</div>
              <div><strong>Port:</strong> {$this->settings['smtp_port']} ({$this->settings['smtp_encryption']})</div>
              <div><strong>From Address:</strong> {$this->settings['from_email']}</div>
              <div><strong>Timestamp:</strong> " . date('Y-m-d H:i:s T') . "</div>
            </div>
            <p style=\"font-size: 12px; color: #64748b; text-align: center; margin: 0;\">Sapphire Trails Luxury Concierge Mail Engine</p>
          </div>
        </div>";

        return $this->send($to, "✅ Sapphire Trails Mail Server Test - " . date('H:i:s'), $html, 'test');
    }

    // ==========================================
    // HTML Email Templates with Luxury Dark/Gold Styling
    // ==========================================

    private function renderCustomerBookingTemplate($bookingId, $name, $tourName, $tourDate, $guests, $adults, $children, $totalPrice, $tourImage = '', $tourDuration = '1 Day Expedition', $specialRequests = null)
    {
        $displayImg = $this->resolveFullImageUrl($tourImage);
        $formattedPrice = number_format((float)$totalPrice, 2);

        return "
        <div style=\"background-color: #06090e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px 12px; color: #f1f5f9; min-height: 100%;\">
          <table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\" style=\"max-width: 620px; margin: 0 auto; background-color: #111622; border: 1px solid #232d40; border-radius: 18px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);\">
            
            <!-- Top Luxury Gold Gradient Bar -->
            <tr>
              <td style=\"height: 4px; background: linear-gradient(90deg, #997838 0%, #d4af37 35%, #fff2be 50%, #d4af37 65%, #997838 100%); font-size: 0; line-height: 0;\">&nbsp;</td>
            </tr>

            <!-- Brand Header -->
            <tr>
              <td style=\"padding: 26px 30px 20px 30px; border-bottom: 1px solid #1c2333;\">
                <table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\">
                  <tr>
                    <td align=\"left\" style=\"vertical-align: middle;\">
                      <table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">
                        <tr>
                          <td style=\"vertical-align: middle; padding-right: 12px;\">
                            <div style=\"width: 42px; height: 42px; border-radius: 12px; background: linear-gradient(135deg, rgba(212,175,55,0.25), rgba(212,175,55,0.06)); border: 1px solid rgba(212,175,55,0.45); text-align: center; line-height: 42px; font-size: 22px;\">
                              💎
                            </div>
                          </td>
                          <td style=\"vertical-align: middle;\">
                            <span style=\"font-family: 'Cinzel', 'Georgia', serif; font-size: 20px; font-weight: bold; letter-spacing: 0.18em; color: #d4af37; text-transform: uppercase; display: block;\">SAPPHIRE TRAILS</span>
                            <span style=\"font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: #94a3b8; display: block; margin-top: 3px;\">Luxury Gem Mine Expeditions &bull; Sri Lanka</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                    <td align=\"right\" style=\"vertical-align: middle;\">
                      <span style=\"display: inline-block; background-color: rgba(212,175,55,0.12); color: #e6ca65; border: 1px solid rgba(212,175,55,0.35); font-size: 11px; font-weight: bold; padding: 6px 14px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.08em; font-family: monospace;\">
                        Ref #{$bookingId}
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Hero Notification -->
            <tr>
              <td style=\"padding: 30px 30px 20px 30px;\">
                <span style=\"display: inline-block; background-color: rgba(52, 211, 153, 0.12); color: #34d399; border: 1px solid rgba(52, 211, 153, 0.3); font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 14px; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px;\">
                  ✓ Reservation Request Received
                </span>
                <h1 style=\"color: #ffffff; font-size: 24px; font-weight: 700; margin: 0 0 10px 0; font-family: 'Cinzel', 'Georgia', serif; letter-spacing: 0.02em; line-height: 1.3;\">
                  Your Expedition Request is Confirmed!
                </h1>
                <p style=\"color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0;\">
                  Dear <strong style=\"color: #ffffff;\">{$name}</strong>, thank you for booking with Sapphire Trails. We have received your reservation inquiry for the <strong style=\"color: #d4af37;\">{$tourName}</strong>. Our luxury concierge is reviewing pit access and logistics and will confirm your pickup schedule shortly.
                </p>
              </td>
            </tr>

            <!-- Visual Tour Showcase Card -->
            <tr>
              <td style=\"padding: 0 30px 22px 30px;\">
                <table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\" style=\"background-color: #0b0f17; border: 1px solid #232c3f; border-radius: 14px; overflow: hidden;\">
                  <tr>
                    <td>
                      <img src=\"{$displayImg}\" alt=\"{$tourName}\" width=\"560\" style=\"width: 100%; max-width: 560px; height: 180px; object-fit: cover; display: block; border-bottom: 1px solid #1f2738;\" />
                    </td>
                  </tr>
                  <tr>
                    <td style=\"padding: 16px 20px;\">
                      <table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\">
                        <tr>
                          <td align=\"left\" style=\"vertical-align: middle;\">
                            <span style=\"font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.12em; color: #94a3b8; display: block;\">Selected Expedition Package</span>
                            <span style=\"font-size: 17px; font-weight: bold; color: #d4af37; font-family: 'Georgia', serif; display: block; margin-top: 2px;\">{$tourName}</span>
                          </td>
                          <td align=\"right\" style=\"vertical-align: middle;\">
                            <span style=\"font-size: 11px; font-weight: 600; color: #cbd5e1; background-color: #171d2b; border: 1px solid #283348; padding: 5px 12px; border-radius: 8px; white-space: nowrap;\">
                              ⏱ {$tourDuration}
                            </span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Booking Details Table -->
            <tr>
              <td style=\"padding: 0 30px 22px 30px;\">
                <table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\" style=\"background-color: #0b0f17; border: 1px solid #232c3f; border-radius: 14px; padding: 18px 20px;\">
                  <tr>
                    <td colspan=\"2\" style=\"padding-bottom: 12px; border-bottom: 1px solid #1a2232;\">
                      <span style=\"font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.12em; color: #d4af37;\">Expedition Summary</span>
                    </td>
                  </tr>
                  <tr>
                    <td style=\"padding: 10px 0; color: #94a3b8; font-size: 13px; border-bottom: 1px solid #161c28; width: 40%;\">Preferred Date:</td>
                    <td style=\"padding: 10px 0; text-align: right; color: #ffffff; font-weight: 600; font-size: 13px; border-bottom: 1px solid #161c28;\">
                      📅 {$tourDate} &bull; 9:00 AM
                    </td>
                  </tr>
                  <tr>
                    <td style=\"padding: 10px 0; color: #94a3b8; font-size: 13px; border-bottom: 1px solid #161c28;\">Travelers / Guests:</td>
                    <td style=\"padding: 10px 0; text-align: right; color: #ffffff; font-weight: 600; font-size: 13px; border-bottom: 1px solid #161c28;\">
                      👥 {$guests} Guest(s) ({$adults} Adults" . ($children > 0 ? ", {$children} Children" : "") . ")
                    </td>
                  </tr>
                  <tr>
                    <td style=\"padding: 10px 0; color: #94a3b8; font-size: 13px; border-bottom: 1px solid #161c28;\">Reservation Status:</td>
                    <td style=\"padding: 10px 0; text-align: right; border-bottom: 1px solid #161c28;\">
                      <span style=\"color: #fbbf24; background-color: rgba(251, 191, 36, 0.12); border: 1px solid rgba(251, 191, 36, 0.3); font-size: 11px; font-weight: bold; padding: 3px 10px; border-radius: 6px;\">
                        Pending Review
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style=\"padding: 12px 0 4px 0; color: #94a3b8; font-size: 13px;\">Estimated Total:</td>
                    <td style=\"padding: 12px 0 4px 0; text-align: right;\">
                      <span style=\"color: #d4af37; font-weight: bold; font-size: 18px; font-family: monospace;\">\${$formattedPrice} USD</span>
                      <span style=\"display: block; font-size: 10px; color: #64748b; margin-top: 2px;\">(Pay on Arrival / Digital Invoice)</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Vehicle Arrangement & Special Requests Callout (if present) -->
            " . (!empty($specialRequests) ? "
            <tr>
              <td style=\"padding: 0 30px 22px 30px;\">
                <div style=\"background-color: #121824; border-left: 3px solid #d4af37; border-radius: 0 10px 10px 0; padding: 14px 18px;\">
                  <span style=\"color: #d4af37; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.08em; display: block; margin-bottom: 4px;\">Vehicle &amp; Special Requests:</span>
                  <p style=\"color: #cbd5e1; font-size: 13px; font-style: italic; margin: 0; line-height: 1.5;\">\"" . nl2br(htmlspecialchars($specialRequests)) . "\"</p>
                </div>
              </td>
            </tr>
            " : "") . "

            <!-- Next Steps Guide -->
            <tr>
              <td style=\"padding: 0 30px 24px 30px;\">
                <table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\" style=\"background-color: #0b0f17; border: 1px solid #232c3f; border-radius: 14px; padding: 18px 20px;\">
                  <tr>
                    <td colspan=\"3\" style=\"padding-bottom: 12px; border-bottom: 1px solid #1a2232;\">
                      <span style=\"font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.12em; color: #d4af37;\">What Happens Next?</span>
                    </td>
                  </tr>
                  <tr>
                    <td style=\"padding: 14px 8px 6px 0; vertical-align: top; width: 33%;\">
                      <span style=\"display: inline-block; width: 22px; height: 22px; border-radius: 50%; background-color: rgba(212,175,55,0.2); color: #d4af37; font-weight: bold; font-size: 11px; text-align: center; line-height: 22px; margin-bottom: 6px;\">1</span>
                      <p style=\"margin: 0; color: #ffffff; font-size: 12px; font-weight: 600;\">Concierge Review</p>
                      <p style=\"margin: 4px 0 0 0; color: #94a3b8; font-size: 11px; line-height: 1.4;\">Verification of active mine pit safety.</p>
                    </td>
                    <td style=\"padding: 14px 8px 6px 8px; vertical-align: top; width: 33%;\">
                      <span style=\"display: inline-block; width: 22px; height: 22px; border-radius: 50%; background-color: rgba(212,175,55,0.2); color: #d4af37; font-weight: bold; font-size: 11px; text-align: center; line-height: 22px; margin-bottom: 6px;\">2</span>
                      <p style=\"margin: 0; color: #ffffff; font-size: 12px; font-weight: 600;\">Confirmed Voucher</p>
                      <p style=\"margin: 4px 0 0 0; color: #94a3b8; font-size: 11px; line-height: 1.4;\">Delivered to your WhatsApp &amp; Email.</p>
                    </td>
                    <td style=\"padding: 14px 0 6px 8px; vertical-align: top; width: 33%;\">
                      <span style=\"display: inline-block; width: 22px; height: 22px; border-radius: 50%; background-color: rgba(212,175,55,0.2); color: #d4af37; font-weight: bold; font-size: 11px; text-align: center; line-height: 22px; margin-bottom: 6px;\">3</span>
                      <p style=\"margin: 0; color: #ffffff; font-size: 12px; font-weight: 600;\">Expedition Day</p>
                      <p style=\"margin: 4px 0 0 0; color: #94a3b8; font-size: 11px; line-height: 1.4;\">VIP private pickup at your location.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Action Buttons -->
            <tr>
              <td style=\"padding: 0 30px 30px 30px; text-align: center;\">
                <table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\">
                  <tr>
                    <td align=\"center\">
                      <a href=\"http://localhost:3000/profile\" style=\"display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #aa8232 100%); color: #0b0d14; font-weight: 700; font-size: 13px; text-decoration: none; padding: 13px 26px; border-radius: 8px; letter-spacing: 0.03em; margin: 4px; box-shadow: 0 4px 14px rgba(212, 175, 55, 0.3);\">
                        View in My Profile Portal &rarr;
                      </a>
                      <a href=\"https://wa.me/94712357700?text=" . urlencode("Hello Sapphire Trails Concierge, I am inquiring about my booking #ST-BK-{$bookingId} ({$name}).") . "\" style=\"display: inline-block; background-color: #15202e; color: #34d399; border: 1px solid rgba(52, 211, 153, 0.4); font-weight: 600; font-size: 13px; text-decoration: none; padding: 12px 22px; border-radius: 8px; margin: 4px;\">
                        💬 WhatsApp Concierge (24/7)
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Luxury Footer -->
            <tr>
              <td style=\"background-color: #0c0f17; border-top: 1px solid #1c2333; padding: 24px 30px; text-align: center;\">
                <p style=\"margin: 0; font-size: 12px; color: #64748b; line-height: 1.6;\">
                  Sapphire Trails Luxury Tour Concierge &bull; Grand Silver Ray Complex, Ratnapura, Sri Lanka
                </p>
                <p style=\"margin: 4px 0 0 0; font-size: 11px; color: #475569;\">
                  Direct: +94 71 235 7700 &bull; reservations@sapphiretrails.lk &bull; www.sapphiretrails.lk
                </p>
                <p style=\"margin: 8px 0 0 0; font-size: 10px; color: #334155;\">
                  &copy; " . date('Y') . " Sapphire Trails (Pvt) Ltd. All rights reserved.
                </p>
              </td>
            </tr>

          </table>
        </div>";
    }

    private function renderAdminBookingTemplate($bookingId, $name, $email, $phone, $tourName, $tourDate, $guests, $adults, $children, $totalPrice, $message, $tourImage = '', $tourDuration = '1 Day Expedition')
    {
        $displayImg = $this->resolveFullImageUrl($tourImage);
        $formattedPrice = number_format((float)$totalPrice, 2);
        
        $cleanPhone = preg_replace('/[^0-9]/', '', $phone);
        if (substr($cleanPhone, 0, 1) === '0') {
            $cleanPhone = '94' . substr($cleanPhone, 1);
        }

        return "
        <div style=\"background-color: #06090e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px 12px; color: #f1f5f9; min-height: 100%;\">
          <table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\" style=\"max-width: 620px; margin: 0 auto; background-color: #111622; border: 1px solid #232d40; border-radius: 18px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);\">
            
            <!-- Top Luxury Gold Gradient Bar -->
            <tr>
              <td style=\"height: 4px; background: linear-gradient(90deg, #997838 0%, #d4af37 35%, #fff2be 50%, #d4af37 65%, #997838 100%); font-size: 0; line-height: 0;\">&nbsp;</td>
            </tr>

            <!-- Brand Header -->
            <tr>
              <td style=\"padding: 26px 30px 20px 30px; border-bottom: 1px solid #1c2333;\">
                <table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\">
                  <tr>
                    <td align=\"left\" style=\"vertical-align: middle;\">
                      <table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">
                        <tr>
                          <td style=\"vertical-align: middle; padding-right: 12px;\">
                            <div style=\"width: 42px; height: 42px; border-radius: 12px; background: linear-gradient(135deg, rgba(212,175,55,0.25), rgba(212,175,55,0.06)); border: 1px solid rgba(212,175,55,0.45); text-align: center; line-height: 42px; font-size: 22px;\">
                              💎
                            </div>
                          </td>
                          <td style=\"vertical-align: middle;\">
                            <span style=\"font-family: 'Cinzel', 'Georgia', serif; font-size: 20px; font-weight: bold; letter-spacing: 0.18em; color: #d4af37; text-transform: uppercase; display: block;\">SAPPHIRE TRAILS</span>
                            <span style=\"font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: #94a3b8; display: block; margin-top: 3px;\">Admin Expedition Concierge Desk</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                    <td align=\"right\" style=\"vertical-align: middle;\">
                      <span style=\"display: inline-block; background-color: rgba(212,175,55,0.15); color: #e6ca65; border: 1px solid rgba(212,175,55,0.4); font-size: 11px; font-weight: bold; padding: 6px 14px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.08em; font-family: monospace;\">
                        New Booking #{$bookingId}
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Hero Notification -->
            <tr>
              <td style=\"padding: 30px 30px 20px 30px;\">
                <span style=\"display: inline-block; background-color: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.35); font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 14px; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px;\">
                  ⚡ Action Required &bull; New Booking Request
                </span>
                <h1 style=\"color: #ffffff; font-size: 24px; font-weight: 700; margin: 0 0 10px 0; font-family: 'Cinzel', 'Georgia', serif; letter-spacing: 0.02em; line-height: 1.3;\">
                  New Tour Booking Request Received
                </h1>
                <p style=\"color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0;\">
                  A new guest has submitted an expedition reservation request for <strong style=\"color: #d4af37;\">{$tourName}</strong>. Please review traveler details and confirm availability.
                </p>
              </td>
            </tr>

            <!-- Tour Visual Showcase Card -->
            <tr>
              <td style=\"padding: 0 30px 22px 30px;\">
                <table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\" style=\"background-color: #0b0f17; border: 1px solid #232c3f; border-radius: 14px; overflow: hidden;\">
                  <tr>
                    <td>
                      <img src=\"{$displayImg}\" alt=\"{$tourName}\" width=\"560\" style=\"width: 100%; max-width: 560px; height: 180px; object-fit: cover; display: block; border-bottom: 1px solid #1f2738;\" />
                    </td>
                  </tr>
                  <tr>
                    <td style=\"padding: 16px 20px;\">
                      <table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\">
                        <tr>
                          <td align=\"left\" style=\"vertical-align: middle;\">
                            <span style=\"font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.12em; color: #94a3b8; display: block;\">Tour Package Requested</span>
                            <span style=\"font-size: 17px; font-weight: bold; color: #d4af37; font-family: 'Georgia', serif; display: block; margin-top: 2px;\">{$tourName}</span>
                          </td>
                          <td align=\"right\" style=\"vertical-align: middle;\">
                            <span style=\"font-size: 11px; font-weight: 600; color: #cbd5e1; background-color: #171d2b; border: 1px solid #283348; padding: 5px 12px; border-radius: 8px; white-space: nowrap;\">
                              ⏱ {$tourDuration}
                            </span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Reservation Parameters Box -->
            <tr>
              <td style=\"padding: 0 30px 20px 30px;\">
                <table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\" style=\"background-color: #0b0f17; border: 1px solid #232c3f; border-radius: 14px; padding: 18px 20px;\">
                  <tr>
                    <td colspan=\"2\" style=\"padding-bottom: 12px; border-bottom: 1px solid #1a2232;\">
                      <span style=\"font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.12em; color: #d4af37;\">Expedition Parameters</span>
                    </td>
                  </tr>
                  <tr>
                    <td style=\"padding: 10px 0; color: #94a3b8; font-size: 13px; border-bottom: 1px solid #161c28; width: 40%;\">Requested Date:</td>
                    <td style=\"padding: 10px 0; text-align: right; color: #ffffff; font-weight: 600; font-size: 13px; border-bottom: 1px solid #161c28;\">
                      📅 {$tourDate} &bull; 9:00 AM
                    </td>
                  </tr>
                  <tr>
                    <td style=\"padding: 10px 0; color: #94a3b8; font-size: 13px; border-bottom: 1px solid #161c28;\">Travelers:</td>
                    <td style=\"padding: 10px 0; text-align: right; color: #ffffff; font-weight: 600; font-size: 13px; border-bottom: 1px solid #161c28;\">
                      👥 {$guests} Total ({$adults} Adults" . ($children > 0 ? ", {$children} Children" : "") . ")
                    </td>
                  </tr>
                  <tr>
                    <td style=\"padding: 10px 0; color: #94a3b8; font-size: 13px; border-bottom: 1px solid #161c28;\">Reservation Status:</td>
                    <td style=\"padding: 10px 0; text-align: right; border-bottom: 1px solid #161c28;\">
                      <span style=\"color: #fbbf24; background-color: rgba(251, 191, 36, 0.12); border: 1px solid rgba(251, 191, 36, 0.3); font-size: 11px; font-weight: bold; padding: 3px 10px; border-radius: 6px;\">
                        Pending Review
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style=\"padding: 12px 0 4px 0; color: #94a3b8; font-size: 13px;\">Estimated Total:</td>
                    <td style=\"padding: 12px 0 4px 0; text-align: right;\">
                      <span style=\"color: #d4af37; font-weight: bold; font-size: 18px; font-family: monospace;\">\${$formattedPrice} USD</span>
                      <span style=\"display: block; font-size: 10px; color: #64748b; margin-top: 2px;\">(Pay on Arrival / Digital Invoice)</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Guest Contact Details Card -->
            <tr>
              <td style=\"padding: 0 30px 22px 30px;\">
                <table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\" style=\"background-color: #0b0f17; border: 1px solid #232c3f; border-radius: 14px; padding: 18px 20px;\">
                  <tr>
                    <td colspan=\"2\" style=\"padding-bottom: 12px; border-bottom: 1px solid #1a2232;\">
                      <span style=\"font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.12em; color: #d4af37;\">Guest Contact Details</span>
                    </td>
                  </tr>
                  <tr>
                    <td style=\"padding: 8px 0; color: #94a3b8; font-size: 13px; width: 35%;\">Lead Guest:</td>
                    <td style=\"padding: 8px 0; text-align: right; color: #ffffff; font-weight: 600; font-size: 13px;\">{$name}</td>
                  </tr>
                  <tr>
                    <td style=\"padding: 8px 0; color: #94a3b8; font-size: 13px;\">Email Address:</td>
                    <td style=\"padding: 8px 0; text-align: right; font-size: 13px;\">
                      <a href=\"mailto:{$email}\" style=\"color: #60a5fa; text-decoration: none; font-weight: 600;\">{$email}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style=\"padding: 8px 0; color: #94a3b8; font-size: 13px;\">Phone / WhatsApp:</td>
                    <td style=\"padding: 8px 0; text-align: right; font-size: 13px;\">
                      <a href=\"tel:{$phone}\" style=\"color: #34d399; text-decoration: none; font-weight: 600;\">{$phone}</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Special Requests Callout (if present) -->
            " . (!empty($message) ? "
            <tr>
              <td style=\"padding: 0 30px 24px 30px;\">
                <div style=\"background-color: #121824; border-left: 3px solid #d4af37; border-radius: 0 10px 10px 0; padding: 14px 18px;\">
                  <span style=\"color: #d4af37; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.08em; display: block; margin-bottom: 4px;\">Special Requests &amp; Notes:</span>
                  <p style=\"color: #cbd5e1; font-size: 13px; font-style: italic; margin: 0; line-height: 1.5;\">\"" . nl2br(htmlspecialchars($message)) . "\"</p>
                </div>
              </td>
            </tr>
            " : "") . "

            <!-- Action CTA Buttons -->
            <tr>
              <td style=\"padding: 0 30px 30px 30px; text-align: center;\">
                <table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\">
                  <tr>
                    <td align=\"center\">
                      <a href=\"http://localhost:3000/admin/bookings\" style=\"display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #aa8232 100%); color: #0b0d14; font-weight: 700; font-size: 13px; text-decoration: none; padding: 13px 26px; border-radius: 8px; letter-spacing: 0.03em; margin: 4px; box-shadow: 0 4px 14px rgba(212, 175, 55, 0.3);\">
                        Manage in Admin Dashboard &rarr;
                      </a>
                      " . (!empty($cleanPhone) ? "
                      <a href=\"https://wa.me/{$cleanPhone}?text=" . urlencode("Hello {$name}, thank you for your booking request with Sapphire Trails (#{$bookingId}).") . "\" style=\"display: inline-block; background-color: #15202e; color: #34d399; border: 1px solid rgba(52, 211, 153, 0.4); font-weight: 600; font-size: 13px; text-decoration: none; padding: 12px 22px; border-radius: 8px; margin: 4px;\">
                        💬 Chat with Guest on WhatsApp
                      </a>
                      " : "") . "
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Luxury Footer -->
            <tr>
              <td style=\"background-color: #0c0f17; border-top: 1px solid #1c2333; padding: 24px 30px; text-align: center;\">
                <p style=\"margin: 0; font-size: 12px; color: #64748b; line-height: 1.6;\">
                  Sapphire Trails Luxury Tour Concierge &bull; Grand Silver Ray Complex, Ratnapura, Sri Lanka
                </p>
                <p style=\"margin: 4px 0 0 0; font-size: 11px; color: #475569;\">
                  Direct: +94 71 235 7700 &bull; reservations@sapphiretrails.lk &bull; www.sapphiretrails.lk
                </p>
                <p style=\"margin: 8px 0 0 0; font-size: 10px; color: #334155;\">
                  &copy; " . date('Y') . " Sapphire Trails (Pvt) Ltd. All rights reserved.
                </p>
              </td>
            </tr>

          </table>
        </div>";
    }

    private function renderCustomerContactTemplate($name, $subject)
    {
        return "
        <div style=\"background-color: #06090e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px 12px; color: #f1f5f9; min-height: 100%;\">
          <table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\" style=\"max-width: 600px; margin: 0 auto; background-color: #111622; border: 1px solid #232d40; border-radius: 18px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);\">
            <tr><td style=\"height: 4px; background: linear-gradient(90deg, #997838 0%, #d4af37 50%, #fff2be 100%); font-size: 0; line-height: 0;\">&nbsp;</td></tr>
            <tr>
              <td style=\"padding: 28px 30px; text-align: center;\">
                <div style=\"width: 44px; height: 44px; margin: 0 auto 12px auto; border-radius: 12px; background: linear-gradient(135deg, rgba(212,175,55,0.25), rgba(212,175,55,0.06)); border: 1px solid rgba(212,175,55,0.45); text-align: center; line-height: 44px; font-size: 24px;\">
                  💎
                </div>
                <span style=\"font-family: 'Cinzel', 'Georgia', serif; font-size: 20px; font-weight: bold; letter-spacing: 0.18em; color: #d4af37; text-transform: uppercase; display: block;\">SAPPHIRE TRAILS</span>
                <span style=\"font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: #94a3b8; display: block; margin-top: 3px;\">Luxury Gem Mine Expeditions &bull; Sri Lanka</span>
                
                <h2 style=\"color: #ffffff; font-size: 22px; font-weight: 700; margin: 24px 0 10px 0; font-family: 'Cinzel', 'Georgia', serif;\">We&apos;ve Received Your Inquiry</h2>
                <p style=\"color: #94a3b8; font-size: 14px; line-height: 1.6; max-width: 460px; margin: 0 auto 20px auto;\">
                  Dear <strong style=\"color: #ffffff;\">{$name}</strong>, thank you for contacting Sapphire Trails. We have received your inquiry regarding <strong style=\"color: #d4af37;\">{$subject}</strong>. One of our destination specialists will get back to you within 24 hours.
                </p>
                <div style=\"margin: 20px 0;\">
                  <a href=\"https://wa.me/94712357700\" style=\"display: inline-block; background-color: #15202e; color: #34d399; border: 1px solid rgba(52, 211, 153, 0.4); font-weight: 600; font-size: 13px; text-decoration: none; padding: 10px 22px; border-radius: 8px;\">
                    💬 WhatsApp Concierge (24/7)
                  </a>
                </div>
              </td>
            </tr>
            <tr>
              <td style=\"background-color: #0c0f17; border-top: 1px solid #1c2333; padding: 18px 24px; font-size: 11px; color: #64748b; text-align: center;\">
                &copy; " . date('Y') . " Sapphire Trails (Pvt) Ltd. Ratnapura, Sri Lanka.
              </td>
            </tr>
          </table>
        </div>";
    }

    private function renderAdminContactTemplate($contactId, $name, $email, $phone, $subject, $message)
    {
        $cleanPhone = preg_replace('/[^0-9]/', '', $phone);
        if (substr($cleanPhone, 0, 1) === '0') {
            $cleanPhone = '94' . substr($cleanPhone, 1);
        }

        return "
        <div style=\"background-color: #06090e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px 12px; color: #f1f5f9; min-height: 100%;\">
          <table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\" style=\"max-width: 600px; margin: 0 auto; background-color: #111622; border: 1px solid #232d40; border-radius: 18px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);\">
            <tr><td style=\"height: 4px; background: linear-gradient(90deg, #997838 0%, #d4af37 50%, #fff2be 100%); font-size: 0; line-height: 0;\">&nbsp;</td></tr>
            <tr>
              <td style=\"padding: 24px 28px; border-bottom: 1px solid #1c2333;\">
                <table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\">
                  <tr>
                    <td align=\"left\" style=\"vertical-align: middle;\">
                      <span style=\"font-size: 18px; font-weight: bold; color: #d4af37; font-family: 'Cinzel', 'Georgia', serif;\">SAPPHIRE TRAILS INQUIRY</span>
                    </td>
                    <td align=\"right\" style=\"vertical-align: middle;\">
                      <span style=\"background-color: rgba(212,175,55,0.15); color: #e6ca65; border: 1px solid rgba(212,175,55,0.4); font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 14px;\">#{$contactId}</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style=\"padding: 24px 28px;\">
                <h2 style=\"color: #ffffff; font-size: 18px; font-weight: 700; margin: 0 0 16px 0;\">{$subject}</h2>
                <table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\" style=\"background-color: #0b0f17; border: 1px solid #232c3f; border-radius: 12px; padding: 16px 18px; font-size: 13px;\">
                  <tr><td style=\"padding: 6px 0; color: #94a3b8; width: 100px;\">From:</td><td style=\"padding: 6px 0; color: #ffffff; font-weight: 600;\">{$name}</td></tr>
                  <tr><td style=\"padding: 6px 0; color: #94a3b8;\">Email:</td><td style=\"padding: 6px 0;\"><a href=\"mailto:{$email}\" style=\"color: #60a5fa; text-decoration: none;\">{$email}</a></td></tr>
                  <tr><td style=\"padding: 6px 0; color: #94a3b8;\">Phone:</td><td style=\"padding: 6px 0;\"><a href=\"tel:{$phone}\" style=\"color: #34d399; text-decoration: none;\">{$phone}</a></td></tr>
                </table>
                <div style=\"margin-top: 16px; background: #0b0f17; border: 1px solid #232c3f; padding: 14px 18px; border-radius: 10px; color: #e2e8f0; font-size: 13px; line-height: 1.6;\">
                  " . nl2br(htmlspecialchars($message)) . "
                </div>
                <div style=\"margin-top: 22px; text-align: center;\">
                  <a href=\"mailto:{$email}?subject=" . urlencode("Re: Sapphire Trails Inquiry #{$contactId} - {$subject}") . "\" style=\"display: inline-block; background: linear-gradient(135deg, #d4af37, #aa8232); color: #0b0d14; font-weight: 700; font-size: 13px; text-decoration: none; padding: 10px 22px; border-radius: 8px; margin: 4px;\">
                    Reply to Email &rarr;
                  </a>
                  " . (!empty($cleanPhone) ? "
                  <a href=\"https://wa.me/{$cleanPhone}?text=" . urlencode("Hello {$name}, regarding your Sapphire Trails inquiry #{$contactId}...") . "\" style=\"display: inline-block; background-color: #15202e; color: #34d399; border: 1px solid rgba(52, 211, 153, 0.4); font-weight: 600; font-size: 13px; text-decoration: none; padding: 10px 20px; border-radius: 8px; margin: 4px;\">
                    💬 WhatsApp
                  </a>
                  " : "") . "
                </div>
              </td>
            </tr>
          </table>
        </div>";
    }

    private function renderCustomerProposalTemplate($name, $tourInterest)
    {
        return "
        <div style=\"background-color: #06090e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px 12px; color: #f1f5f9; min-height: 100%;\">
          <table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\" style=\"max-width: 600px; margin: 0 auto; background-color: #111622; border: 1px solid #232d40; border-radius: 18px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);\">
            <tr><td style=\"height: 4px; background: linear-gradient(90deg, #997838 0%, #d4af37 50%, #fff2be 100%); font-size: 0; line-height: 0;\">&nbsp;</td></tr>
            <tr>
              <td style=\"padding: 28px 30px; text-align: center;\">
                <div style=\"width: 44px; height: 44px; margin: 0 auto 12px auto; border-radius: 12px; background: linear-gradient(135deg, rgba(212,175,55,0.25), rgba(212,175,55,0.06)); border: 1px solid rgba(212,175,55,0.45); text-align: center; line-height: 44px; font-size: 24px;\">
                  💎
                </div>
                <span style=\"font-family: 'Cinzel', 'Georgia', serif; font-size: 20px; font-weight: bold; letter-spacing: 0.18em; color: #d4af37; text-transform: uppercase; display: block;\">SAPPHIRE TRAILS</span>
                <h2 style=\"color: #ffffff; font-size: 22px; font-weight: 700; margin: 24px 0 10px 0; font-family: 'Cinzel', 'Georgia', serif;\">Bespoke Proposal Request Received</h2>
                <p style=\"color: #94a3b8; font-size: 14px; line-height: 1.6; max-width: 460px; margin: 0 auto 24px auto;\">
                  Dear <strong style=\"color: #ffffff;\">{$name}</strong>, thank you for your bespoke tour inquiry for <strong style=\"color: #d4af37;\">{$tourInterest}</strong>. Our luxury travel curators are crafting a customized itinerary for you and will be in touch shortly.
                </p>
                <a href=\"https://wa.me/94712357700\" style=\"display: inline-block; background-color: #15202e; color: #34d399; border: 1px solid rgba(52, 211, 153, 0.4); font-weight: 600; font-size: 13px; text-decoration: none; padding: 10px 22px; border-radius: 8px;\">
                  💬 WhatsApp Concierge (24/7)
                </a>
              </td>
            </tr>
            <tr>
              <td style=\"background-color: #0c0f17; border-top: 1px solid #1c2333; padding: 18px 24px; font-size: 11px; color: #64748b; text-align: center;\">
                &copy; " . date('Y') . " Sapphire Trails Luxury Tours. Ratnapura, Sri Lanka.
              </td>
            </tr>
          </table>
        </div>";
    }

    private function renderAdminProposalTemplate($name, $email, $phone, $tourInterest, $dates, $partySize, $requirements)
    {
        $cleanPhone = preg_replace('/[^0-9]/', '', $phone);
        if (substr($cleanPhone, 0, 1) === '0') {
            $cleanPhone = '94' . substr($cleanPhone, 1);
        }

        return "
        <div style=\"background-color: #06090e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px 12px; color: #f1f5f9; min-height: 100%;\">
          <table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\" style=\"max-width: 600px; margin: 0 auto; background-color: #111622; border: 1px solid #232d40; border-radius: 18px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);\">
            <tr><td style=\"height: 4px; background: linear-gradient(90deg, #997838 0%, #d4af37 50%, #fff2be 100%); font-size: 0; line-height: 0;\">&nbsp;</td></tr>
            <tr>
              <td style=\"padding: 24px 28px; border-bottom: 1px solid #1c2333;\">
                <span style=\"font-size: 18px; font-weight: bold; color: #d4af37; font-family: 'Cinzel', 'Georgia', serif;\">💎 BESPOKE TOUR INQUIRY</span>
              </td>
            </tr>
            <tr>
              <td style=\"padding: 24px 28px;\">
                <h2 style=\"color: #ffffff; font-size: 18px; font-weight: 700; margin: 0 0 16px 0;\">{$tourInterest}</h2>
                <table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\" style=\"background-color: #0b0f17; border: 1px solid #232c3f; border-radius: 12px; padding: 16px 18px; font-size: 13px;\">
                  <tr><td style=\"padding: 6px 0; color: #94a3b8; width: 120px;\">Client:</td><td style=\"padding: 6px 0; color: #ffffff; font-weight: 600;\">{$name}</td></tr>
                  <tr><td style=\"padding: 6px 0; color: #94a3b8;\">Email:</td><td style=\"padding: 6px 0;\"><a href=\"mailto:{$email}\" style=\"color: #60a5fa; text-decoration: none;\">{$email}</a></td></tr>
                  <tr><td style=\"padding: 6px 0; color: #94a3b8;\">Phone:</td><td style=\"padding: 6px 0;\"><a href=\"tel:{$phone}\" style=\"color: #34d399; text-decoration: none;\">{$phone}</a></td></tr>
                  <tr><td style=\"padding: 6px 0; color: #94a3b8;\">Dates:</td><td style=\"padding: 6px 0; color: #ffffff;\">{$dates}</td></tr>
                  <tr><td style=\"padding: 6px 0; color: #94a3b8;\">Party Size:</td><td style=\"padding: 6px 0; color: #ffffff;\">{$partySize}</td></tr>
                </table>
                <div style=\"margin-top: 16px; background: #0b0f17; border: 1px solid #232c3f; padding: 14px 18px; border-radius: 10px; color: #e2e8f0; font-size: 13px; line-height: 1.6;\">
                  " . nl2br(htmlspecialchars($requirements)) . "
                </div>
                <div style=\"margin-top: 22px; text-align: center;\">
                  <a href=\"mailto:{$email}?subject=" . urlencode("Sapphire Trails - Bespoke Tour Proposal for {$tourInterest}") . "\" style=\"display: inline-block; background: linear-gradient(135deg, #d4af37, #aa8232); color: #0b0d14; font-weight: 700; font-size: 13px; text-decoration: none; padding: 10px 22px; border-radius: 8px; margin: 4px;\">
                    Reply to Client &rarr;
                  </a>
                  " . (!empty($cleanPhone) ? "
                  <a href=\"https://wa.me/{$cleanPhone}\" style=\"display: inline-block; background-color: #15202e; color: #34d399; border: 1px solid rgba(52, 211, 153, 0.4); font-weight: 600; font-size: 13px; text-decoration: none; padding: 10px 20px; border-radius: 8px; margin: 4px;\">
                    💬 WhatsApp
                  </a>
                  " : "") . "
                </div>
              </td>
            </tr>
          </table>
        </div>";
    }

    /**
     * Send Tour Rescheduled Confirmation Email
     */
    public function sendRescheduleEmail($booking, $previousDate, $newDate, $newEndDate, $reason, $tourPackage = null, $invoice = null)
    {
        $name = $booking['name'] ?? 'Traveler';
        $email = $booking['email'] ?? '';
        $bookingId = $booking['id'] ?? '';
        $tourTitle = $tourPackage['homepage_title'] ?? $booking['tour_title'] ?? 'Gem Mine Tour Experience';
        $guests = $booking['guests'] ?? 1;

        $formattedOldDate = date('F d, Y', strtotime($previousDate));
        $formattedNewDate = date('F d, Y', strtotime($newDate));
        if (!empty($newEndDate) && $newEndDate !== $newDate) {
            $formattedNewDate .= ' to ' . date('F d, Y', strtotime($newEndDate));
        }

        $invoiceLink = !empty($invoice['invoice_number']) 
            ? "http://localhost:3000/invoices/{$invoice['invoice_number']}" 
            : "http://localhost:3000/booking";

        if (!empty($email)) {
            $customerHtml = $this->renderRescheduleTemplate($bookingId, $name, $tourTitle, $formattedOldDate, $formattedNewDate, $guests, $reason, $invoiceLink);
            $this->send($email, "🗓️ Tour Rescheduled & Confirmed: $tourTitle (Ref #$bookingId)", $customerHtml, 'booking_rescheduled');
        }

        // Admin Notification
        $adminEmails = $this->settings['admin_emails'];
        if (!empty($adminEmails)) {
            $adminHtml = "
            <div style=\"background-color: #06090e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px 12px; color: #f1f5f9; min-height: 100%;\">
              <table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\" style=\"max-width: 600px; margin: 0 auto; background-color: #111622; border: 1px solid #232d40; border-radius: 18px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);\">
                <tr><td style=\"height: 4px; background: linear-gradient(90deg, #997838 0%, #d4af37 50%, #fff2be 100%); font-size: 0; line-height: 0;\">&nbsp;</td></tr>
                <tr>
                  <td style=\"padding: 24px 28px; border-bottom: 1px solid #1c2333;\">
                    <table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\">
                      <tr>
                        <td align=\"left\"><span style=\"font-size: 17px; font-weight: bold; color: #d4af37; font-family: 'Cinzel', 'Georgia', serif;\">BOOKING RESCHEDULED</span></td>
                        <td align=\"right\"><span style=\"background-color: rgba(251, 191, 36, 0.15); color: #fbbf24; border: 1px solid rgba(251, 191, 36, 0.4); font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 12px;\">#{$bookingId}</span></td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style=\"padding: 24px 28px;\">
                    <h2 style=\"color: #ffffff; font-size: 18px; font-weight: 700; margin: 0 0 16px 0;\">Expedition Dates Updated</h2>
                    <table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\" style=\"background-color: #0b0f17; border: 1px solid #232c3f; border-radius: 12px; padding: 16px 18px; font-size: 13px;\">
                      <tr><td style=\"padding: 6px 0; color: #94a3b8; width: 120px;\">Guest:</td><td style=\"padding: 6px 0; color: #ffffff; font-weight: 600;\">{$name} ({$email})</td></tr>
                      <tr><td style=\"padding: 6px 0; color: #94a3b8;\">Tour:</td><td style=\"padding: 6px 0; color: #d4af37; font-weight: 600;\">{$tourTitle}</td></tr>
                      <tr><td style=\"padding: 6px 0; color: #94a3b8;\">Previous Date:</td><td style=\"padding: 6px 0; color: #f87171; text-decoration: line-through;\">{$formattedOldDate}</td></tr>
                      <tr><td style=\"padding: 6px 0; color: #94a3b8;\">New Date:</td><td style=\"padding: 6px 0; color: #34d399; font-weight: bold; font-size: 14px;\">{$formattedNewDate}</td></tr>
                      <tr><td style=\"padding: 6px 0; color: #94a3b8;\">Reason:</td><td style=\"padding: 6px 0; color: #e2e8f0; font-style: italic;\">" . htmlspecialchars($reason ?: 'Requested by traveler') . "</td></tr>
                    </table>
                    <div style=\"margin-top: 22px; text-align: center;\">
                      <a href=\"http://localhost:3000/admin/bookings\" style=\"display: inline-block; background: linear-gradient(135deg, #d4af37, #aa8232); color: #0b0d14; font-weight: 700; font-size: 13px; text-decoration: none; padding: 10px 22px; border-radius: 8px;\">
                        Manage in Admin Dashboard &rarr;
                      </a>
                    </div>
                  </td>
                </tr>
              </table>
            </div>";
            $this->send($adminEmails, "🗓️ Booking #$bookingId Rescheduled to $formattedNewDate - $name", $adminHtml, 'rescheduled_admin', '', $this->settings['admin_emails_cc'], $this->settings['admin_emails_bcc']);
        }
    }

    private function renderRescheduleTemplate($bookingId, $name, $tourTitle, $oldDate, $newDate, $guests, $reason, $invoiceLink)
    {
        return "
        <div style=\"background-color: #0b0d11; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px 15px; color: #f8fafc;\">
          <div style=\"max-width: 600px; margin: 0 auto; background-color: #141721; border: 1px solid #c79954; border-radius: 18px; padding: 36px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);\">
            
            <div style=\"text-align: center; border-bottom: 1px solid #2d3748; padding-bottom: 24px; margin-bottom: 24px;\">
              <span style=\"font-size: 24px; letter-spacing: 0.18em; font-weight: bold; color: #c79954;\">SAPPHIRE TRAILS</span>
              <p style=\"margin: 4px 0 0 0; font-size: 11px; letter-spacing: 0.12em; color: #94a3b8; text-transform: uppercase;\">Luxury Gem Mine Expeditions &bull; Ratnapura, Sri Lanka</p>
            </div>

            <div style=\"text-align: center; margin-bottom: 24px;\">
              <span style=\"background-color: rgba(16, 185, 129, 0.15); color: #34d399; font-size: 12px; font-weight: bold; padding: 6px 14px; border-radius: 9999px; border: 1px solid rgba(16, 185, 129, 0.3); text-transform: uppercase; letter-spacing: 0.05em;\">
                ✓ Tour Dates Updated &amp; Confirmed
              </span>
              <h1 style=\"color: #ffffff; font-size: 24px; margin: 16px 0 8px 0; font-weight: 700;\">Your Tour Has Been Rescheduled</h1>
              <p style=\"color: #94a3b8; font-size: 14px; margin: 0;\">Dear {$name}, your reservation dates for <strong>{$tourTitle}</strong> have been successfully updated.</p>
            </div>

            <!-- Date Change Comparison Card -->
            <div style=\"background-color: #0f1115; border: 1px solid #2d3748; border-radius: 12px; padding: 20px; margin-bottom: 24px;\">
              <table style=\"width: 100%; font-size: 14px; border-collapse: collapse;\">
                <tr style=\"border-bottom: 1px solid #1e2533;\">
                  <td style=\"padding: 10px 0; color: #94a3b8; width: 140px;\">Previous Date:</td>
                  <td style=\"padding: 10px 0; text-align: right; color: #f87171; text-decoration: line-through;\">{$oldDate}</td>
                </tr>
                <tr style=\"border-bottom: 1px solid #1e2533;\">
                  <td style=\"padding: 12px 0; color: #ffffff; font-weight: bold;\">New Confirmed Date:</td>
                  <td style=\"padding: 12px 0; text-align: right; color: #34d399; font-weight: bold; font-size: 16px;\">{$newDate}</td>
                </tr>
                <tr style=\"border-bottom: 1px solid #1e2533;\">
                  <td style=\"padding: 10px 0; color: #94a3b8;\">Travelers:</td>
                  <td style=\"padding: 10px 0; text-align: right; color: #ffffff;\">{$guests} Guest(s)</td>
                </tr>
                <tr>
                  <td style=\"padding: 10px 0; color: #94a3b8;\">Booking Reference:</td>
                  <td style=\"padding: 10px 0; text-align: right; color: #c79954; font-family: monospace; font-weight: bold;\">#ST-BK-{$bookingId}</td>
                </tr>
              </table>
            </div>

            " . (!empty($reason) ? "
            <div style=\"background-color: #1a1e2b; border-left: 4px solid #c79954; border-radius: 0 8px 8px 0; padding: 12px 16px; margin-bottom: 24px;\">
              <span style=\"color: #c79954; font-size: 11px; font-weight: bold; text-transform: uppercase;\">Reschedule Reason:</span>
              <p style=\"margin: 4px 0 0 0; font-size: 13px; color: #e2e8f0; font-style: italic;\">\"" . htmlspecialchars($reason) . "\"</p>
            </div>
            " : "") . "

            <div style=\"text-align: center; margin: 30px 0;\">
              <a href=\"{$invoiceLink}\" style=\"display: inline-block; background: linear-gradient(135deg, #c79954, #a87e38); color: #000; font-weight: bold; font-size: 14px; text-decoration: none; padding: 14px 32px; border-radius: 8px; box-shadow: 0 4px 12px rgba(199, 153, 84, 0.3);\">
                View Updated Invoice &amp; Details &rarr;
              </a>
            </div>

            <div style=\"border-top: 1px solid #2d3748; padding-top: 20px; font-size: 12px; color: #64748b; text-align: center;\">
              <p style=\"margin: 0 0 6px 0;\">Need further changes or private transportation? Reply to this email or contact our Concierge.</p>
              <p style=\"margin: 0;\">&copy; " . date('Y') . " Sapphire Trails (Pvt) Ltd. Ratnapura, Sri Lanka.</p>
            </div>
          </div>
        </div>";
    }

    /**
     * Send Official Branded Luxury Invoice Email to Customer
     */
    public function sendInvoiceEmail($invoice, $booking = null)
    {
        $customerEmail = $invoice['customer_email'];
        if (empty($customerEmail)) return ['success' => false, 'error' => 'No customer email provided'];

        $invoiceNumber = $invoice['invoice_number'];
        $customerName = $invoice['customer_name'];
        $totalAmount = floatval($invoice['total_amount']);
        $currency = $invoice['currency'] ?? 'USD';
        $paymentStatus = $invoice['payment_status'] ?? 'unpaid';
        $issueDate = date('F d, Y', strtotime($invoice['issue_date']));
        $dueDate = !empty($invoice['due_date']) ? date('F d, Y', strtotime($invoice['due_date'])) : 'Upon Arrival';
        $tourDate = !empty($invoice['tour_date']) ? date('F d, Y', strtotime($invoice['tour_date'])) : 'To Be Confirmed';

        $items = $invoice['items'] ?? [];
        $itemsHtml = '';
        foreach ($items as $item) {
            $lineQty = floatval($item['quantity']);
            $unitP = number_format(floatval($item['unit_price']), 2);
            $totalP = number_format(floatval($item['total_price']), 2);
            $desc = htmlspecialchars($item['description']);
            $itemsHtml .= "
            <tr style=\"border-bottom: 1px solid #262c3b;\">
              <td style=\"padding: 12px 8px; color: #ffffff;\">{$desc}</td>
              <td style=\"padding: 12px 8px; text-align: center; color: #94a3b8;\">{$lineQty}</td>
              <td style=\"padding: 12px 8px; text-align: right; color: #94a3b8;\">{$currency} {$unitP}</td>
              <td style=\"padding: 12px 8px; text-align: right; color: #c79954; font-weight: bold;\">{$currency} {$totalP}</td>
            </tr>";
        }

        $viewUrl = "http://localhost:3000/invoices/{$invoiceNumber}";

        $statusColor = $paymentStatus === 'paid' ? '#10b981' : ($paymentStatus === 'partially_paid' ? '#3b82f6' : '#f59e0b');
        $statusText = strtoupper(str_replace('_', ' ', $paymentStatus));

        $html = "
        <div style=\"background-color: #0b0d11; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px 15px; color: #f8fafc;\">
          <div style=\"max-width: 640px; margin: 0 auto; background-color: #141721; border: 1px solid #c79954; border-radius: 18px; padding: 36px; box-shadow: 0 10px 30px rgba(0,0,0,0.6);\">
            
            <div style=\"display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #2d3748; padding-bottom: 20px; margin-bottom: 24px;\">
              <div>
                <span style=\"font-size: 22px; letter-spacing: 0.15em; font-weight: bold; color: #c79954;\">SAPPHIRE TRAILS</span>
                <p style=\"margin: 2px 0 0 0; font-size: 11px; color: #94a3b8;\">Luxury Gem Mine Expeditions &bull; Sri Lanka</p>
              </div>
              <div style=\"text-align: right;\">
                <span style=\"display: inline-block; background-color: {$statusColor}20; color: {$statusColor}; border: 1px solid {$statusColor}50; font-size: 12px; font-weight: bold; padding: 4px 12px; border-radius: 6px;\">
                  {$statusText}
                </span>
                <p style=\"margin: 4px 0 0 0; font-size: 12px; font-family: monospace; color: #94a3b8;\">{$invoiceNumber}</p>
              </div>
            </div>

            <div style=\"margin-bottom: 24px;\">
              <h2 style=\"color: #ffffff; font-size: 20px; margin: 0 0 8px 0;\">Official Tour Invoice</h2>
              <p style=\"color: #94a3b8; font-size: 13px; margin: 0;\">Billed to: <strong style=\"color: #ffffff;\">{$customerName}</strong> ({$customerEmail})</p>
              <p style=\"color: #94a3b8; font-size: 13px; margin: 4px 0 0 0;\">Tour Date: <strong style=\"color: #c79954;\">{$tourDate}</strong> | Due: <strong style=\"color: #ffffff;\">{$dueDate}</strong></p>
            </div>

            <!-- Itemized Table -->
            <table style=\"width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;\">
              <thead>
                <tr style=\"background-color: #1a1e2b; border-bottom: 2px solid #2d3748;\">
                  <th style=\"padding: 10px 8px; text-align: left; color: #94a3b8;\">Item Description</th>
                  <th style=\"padding: 10px 8px; text-align: center; color: #94a3b8; width: 50px;\">Qty</th>
                  <th style=\"padding: 10px 8px; text-align: right; color: #94a3b8; width: 100px;\">Rate</th>
                  <th style=\"padding: 10px 8px; text-align: right; color: #94a3b8; width: 100px;\">Total</th>
                </tr>
              </thead>
              <tbody>
                {$itemsHtml}
              </tbody>
            </table>

            <!-- Totals Summary -->
            <div style=\"background-color: #0f1115; border: 1px solid #2d3748; border-radius: 12px; padding: 18px; margin-bottom: 24px;\">
              <table style=\"width: 100%; font-size: 13px; border-collapse: collapse;\">
                <tr>
                  <td style=\"padding: 6px 0; color: #94a3b8;\">Subtotal:</td>
                  <td style=\"padding: 6px 0; text-align: right; color: #ffffff;\">{$currency} " . number_format(floatval($invoice['subtotal']), 2) . "</td>
                </tr>
                " . (floatval($invoice['discount_amount']) > 0 ? "
                <tr>
                  <td style=\"padding: 6px 0; color: #34d399;\">Discount:</td>
                  <td style=\"padding: 6px 0; text-align: right; color: #34d399;\">- {$currency} " . number_format(floatval($invoice['discount_amount']), 2) . "</td>
                </tr>" : "") . "
                " . (floatval($invoice['tax_amount']) > 0 ? "
                <tr>
                  <td style=\"padding: 6px 0; color: #94a3b8;\">Taxes / Service:</td>
                  <td style=\"padding: 6px 0; text-align: right; color: #ffffff;\">+ {$currency} " . number_format(floatval($invoice['tax_amount']), 2) . "</td>
                </tr>" : "") . "
                <tr style=\"border-top: 1px solid #2d3748;\">
                  <td style=\"padding: 10px 0 0 0; color: #ffffff; font-size: 15px; font-weight: bold;\">Total Amount:</td>
                  <td style=\"padding: 10px 0 0 0; text-align: right; color: #c79954; font-size: 18px; font-weight: bold;\">{$currency} " . number_format($totalAmount, 2) . "</td>
                </tr>
                <tr>
                  <td style=\"padding: 6px 0 0 0; color: #94a3b8;\">Balance Due:</td>
                  <td style=\"padding: 6px 0 0 0; text-align: right; color: " . (floatval($invoice['balance_due']) > 0 ? '#f59e0b' : '#34d399') . "; font-weight: bold;\">{$currency} " . number_format(floatval($invoice['balance_due']), 2) . "</td>
                </tr>
              </table>
            </div>

            " . (!empty($invoice['bank_details']) ? "
            <div style=\"background-color: #171c26; border: 1px dashed #3a455a; border-radius: 10px; padding: 16px; margin-bottom: 24px;\">
              <span style=\"color: #c79954; font-size: 12px; font-weight: bold; text-transform: uppercase;\">Payment Instructions / Bank Details</span>
              <p style=\"margin: 6px 0 0 0; font-size: 12px; color: #cbd5e1; line-height: 1.6;\">" . nl2br(htmlspecialchars($invoice['bank_details'])) . "</p>
            </div>
            " : "") . "

            <div style=\"text-align: center; margin: 28px 0;\">
              <a href=\"{$viewUrl}\" style=\"display: inline-block; background: linear-gradient(135deg, #c79954, #a87e38); color: #000; font-weight: bold; font-size: 14px; text-decoration: none; padding: 14px 32px; border-radius: 8px;\">
                View &amp; Print Full Invoice &rarr;
              </a>
            </div>

            <div style=\"border-top: 1px solid #2d3748; padding-top: 16px; font-size: 11px; color: #64748b; text-align: center;\">
              <p style=\"margin: 0;\">&copy; " . date('Y') . " Sapphire Trails (Pvt) Ltd. Grand Silver Ray, Ratnapura, Sri Lanka.</p>
            </div>
          </div>
        </div>";

        return $this->send($customerEmail, "Official Tour Invoice {$invoiceNumber} - Sapphire Trails", $html, 'invoice_customer');
    }

    /**
     * Send Booking Accepted & Confirmed Email to Customer
     */
    public function sendBookingAcceptedEmail($booking, $tourPackage = null)
    {
        $guestEmail = $booking['email'] ?? '';
        if (empty($guestEmail)) {
            return ['success' => false, 'error' => 'No guest email provided'];
        }

        $bookingId  = $booking['id'] ?? '';
        $guestName  = $booking['name'] ?? 'Valued Guest';
        $tourName   = $booking['tour_title'] ?? ($tourPackage['tour_page_title'] ?? $tourPackage['homepage_title'] ?? 'Luxury Gem Mine Expedition');
        $tourDate   = !empty($booking['tour_date']) ? date('F d, Y', strtotime($booking['tour_date'])) : 'To be arranged';
        $endDate    = !empty($booking['end_date']) && $booking['end_date'] !== $booking['tour_date'] ? date('F d, Y', strtotime($booking['end_date'])) : null;
        $dateStr    = $endDate ? "{$tourDate} to {$endDate}" : $tourDate;
        $guests     = $booking['guests'] ?? 1;
        $adults     = $booking['adults'] ?? $guests;
        $children   = $booking['children'] ?? 0;

        $invoiceId     = $booking['invoice_id'] ?? null;
        $invoiceNumber = $booking['invoice_number'] ?? null;
        $invoiceUrl    = $invoiceNumber ? "https://sapphiretrails.lk/invoices/{$invoiceNumber}" : "https://sapphiretrails.lk";

        $html = "
        <div style=\"background-color: #090b0e; font-family: 'Montserrat', Helvetica, Arial, sans-serif; padding: 40px 15px; color: #f8fafc;\">
          <div style=\"max-width: 600px; margin: 0 auto; background-color: #12151d; border: 1px solid #c7995440; border-radius: 16px; padding: 36px 28px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);\">
            
            <!-- Header -->
            <div style=\"text-align: center; border-bottom: 1px solid #232733; padding-bottom: 24px; margin-bottom: 28px;\">
              <span style=\"font-size: 24px; letter-spacing: 0.18em; font-weight: bold; color: #c79954; font-family: 'Cinzel', Georgia, serif;\">SAPPHIRE TRAILS</span>
              <p style=\"margin: 4px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #94a3b8;\">Luxury Gem Mine Expeditions &bull; Sri Lanka</p>
            </div>

            <!-- Success Hero Badge -->
            <div style=\"text-align: center; margin-bottom: 28px;\">
              <span style=\"display: inline-block; background-color: #05966920; color: #34d399; border: 1px solid #05966960; font-size: 12px; font-weight: bold; padding: 6px 18px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 14px;\">
                ✓ Booking Confirmed &amp; Accepted
              </span>
              <h1 style=\"color: #ffffff; font-size: 22px; font-weight: 700; margin: 0 0 8px 0;\">Your Expedition is Confirmed, {$guestName}!</h1>
              <p style=\"color: #94a3b8; font-size: 14px; margin: 0; line-height: 1.5;\">
                We are delighted to confirm your private gem mining reservation. Our concierge team is preparing an unforgettable experience for you.
              </p>
            </div>

            <!-- Expedition Summary Card -->
            <div style=\"background-color: #181c26; border: 1px solid #2b3345; border-radius: 12px; padding: 22px; margin-bottom: 24px;\">
              <h3 style=\"color: #c79954; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 16px 0; border-bottom: 1px solid #2b3345; padding-bottom: 8px;\">
                Confirmed Expedition Details
              </h3>
              
              <table style=\"width: 100%; font-size: 13px; border-collapse: collapse;\">
                <tr>
                  <td style=\"padding: 6px 0; color: #94a3b8; width: 40%;\">Reservation Ref:</td>
                  <td style=\"padding: 6px 0; color: #ffffff; font-family: monospace; font-weight: bold;\">#ST-BK-{$bookingId}</td>
                </tr>
                <tr>
                  <td style=\"padding: 6px 0; color: #94a3b8;\">Tour Package:</td>
                  <td style=\"padding: 6px 0; color: #ffffff; font-weight: 600;\">{$tourName}</td>
                </tr>
                <tr>
                  <td style=\"padding: 6px 0; color: #94a3b8;\">Confirmed Date:</td>
                  <td style=\"padding: 6px 0; color: #34d399; font-weight: bold; font-size: 14px;\">{$dateStr}</td>
                </tr>
                <tr>
                  <td style=\"padding: 6px 0; color: #94a3b8;\">Party Size:</td>
                  <td style=\"padding: 6px 0; color: #ffffff;\">{$guests} Traveler(s) ({$adults} Adults" . ($children > 0 ? ", {$children} Children" : "") . ")</td>
                </tr>
              </table>
            </div>

            <!-- What to Expect Card -->
            <div style=\"background-color: #12151d; border: 1px solid #232733; border-radius: 12px; padding: 18px; margin-bottom: 26px;\">
              <h4 style=\"color: #ffffff; font-size: 13px; margin: 0 0 10px 0;\">💎 What&apos;s Included in Your Private Tour:</h4>
              <ul style=\"margin: 0; padding-left: 18px; font-size: 12px; color: #cbd5e1; line-height: 1.8;\">
                <li>VIP air-conditioned private vehicle transportation.</li>
                <li>Exclusive private access to active traditional gem mining pits in Ratnapura.</li>
                <li>Hands-on gem washing in local streams &amp; sorting experience.</li>
                <li>Expert licensed gemologist guidance &amp; rough sapphire valuation workshop.</li>
                <li>Complimentary traditional Sri Lankan refreshments.</li>
              </ul>
            </div>

            <!-- Action Buttons -->
            <div style=\"text-align: center; margin-bottom: 28px;\">
              " . ($invoiceNumber ? "
              <a href=\"{$invoiceUrl}\" style=\"display: inline-block; background: linear-gradient(135deg, #c79954, #a87e38); color: #000; font-weight: 700; font-size: 13px; text-decoration: none; padding: 12px 28px; border-radius: 8px; margin: 4px;\">
                View Digital Invoice &amp; Payment Details &rarr;
              </a>
              " : "") . "
              <a href=\"https://wa.me/94712357700?text=" . urlencode("Hello Sapphire Trails, I am inquiring about my confirmed booking #ST-BK-{$bookingId} ({$guestName}).") . "\" style=\"display: inline-block; background-color: #1e293b; color: #34d399; border: 1px solid #05966950; font-weight: 600; font-size: 13px; text-decoration: none; padding: 12px 24px; border-radius: 8px; margin: 4px;\">
                💬 WhatsApp Concierge (24/7)
              </a>
            </div>

            <!-- Footer -->
            <div style=\"border-top: 1px solid #232733; padding-top: 18px; font-size: 11px; color: #64748b; text-align: center; line-height: 1.6;\">
              <p style=\"margin: 0;\">Grand Silver Ray Complex, Colombo - Batticaloa Hwy, Ratnapura, Sri Lanka</p>
              <p style=\"margin: 4px 0 0 0;\">Direct: +94 71 235 7700 &bull; reservations@sapphiretrails.lk</p>
              <p style=\"margin: 8px 0 0 0;\">&copy; " . date('Y') . " Sapphire Trails (Pvt) Ltd. All rights reserved.</p>
            </div>

          </div>
        </div>";

        return $this->send($guestEmail, "✨ Confirmed: Your Gem Mine Tour is Scheduled! - Sapphire Trails (#ST-BK-{$bookingId})", $html, 'booking_confirmed');
    }

    /**
     * Send direct reply to customer inquiry
     */
    public function sendInquiryReplyEmail($contact, $replyMessage, $customSubject = null)
    {
        $guestName = $contact['name'] ?? 'Valued Guest';
        $guestEmail = $contact['email'] ?? '';
        $inquiryId = $contact['id'] ?? '';
        $originalMessage = $contact['message'] ?? '';
        $originalSubject = $contact['subject'] ?? $contact['tour_interest'] ?? 'General Inquiry';
        $subject = $customSubject ?: ("Re: " . ($contact['subject'] ?: 'Your Inquiry with Sapphire Trails'));

        if (empty($guestEmail)) {
            return ['success' => false, 'error' => 'Recipient email address is missing'];
        }

        $formattedReply = nl2br(htmlspecialchars($replyMessage));
        $formattedOriginal = nl2br(htmlspecialchars($originalMessage));

        $html = "
        <div style=\"background-color: #0b0d11; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 36px 16px; color: #f1f5f9;\">
          <div style=\"max-width: 620px; margin: 0 auto; background-color: #13161f; border: 1px solid #242938; border-radius: 14px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);\">
            
            <!-- Header / Brand -->
            <div style=\"text-align: center; border-bottom: 1px solid #232838; padding-bottom: 22px; margin-bottom: 24px;\">
              <span style=\"font-size: 26px; letter-spacing: 0.15em; font-weight: 800; color: #d4af37;\">SAPPHIRE TRAILS</span>
              <p style=\"font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; color: #94a3b8; margin: 4px 0 0 0;\">Ratnapura &bull; Sri Lanka &bull; Gem Tours &amp; Luxury Bespoke Experiences</p>
            </div>

            <!-- Greeting -->
            <div style=\"margin-bottom: 22px;\">
              <p style=\"font-size: 16px; font-weight: 600; color: #f8fafc; margin: 0 0 12px 0;\">Dear {$guestName},</p>
              <div style=\"font-size: 14px; line-height: 1.7; color: #cbd5e1; white-space: pre-wrap;\">
                {$formattedReply}
              </div>
            </div>

            <!-- Quick Contact & WhatsApp -->
            <div style=\"background: linear-gradient(135deg, rgba(212,175,55,0.08), rgba(212,175,55,0.02)); border: 1px solid rgba(212,175,55,0.25); border-radius: 10px; padding: 18px; margin: 26px 0; text-align: center;\">
              <p style=\"font-size: 12px; color: #e2e8f0; margin: 0 0 10px 0; font-weight: 500;\">Have additional questions or need immediate bespoke arrangements?</p>
              <a href=\"https://wa.me/94712357700?text=" . urlencode("Hello Sapphire Trails, I am following up on inquiry #{$inquiryId} ({$guestName}).") . "\" style=\"display: inline-block; background-color: #059669; color: #ffffff; font-weight: 600; font-size: 12px; text-decoration: none; padding: 9px 20px; border-radius: 6px;\">
                💬 Chat with our Concierge on WhatsApp
              </a>
            </div>

            <!-- Original Inquiry Reference -->
            <div style=\"background-color: #0d1017; border-left: 3px solid #64748b; border-radius: 0 8px 8px 0; padding: 14px 18px; margin-bottom: 26px;\">
              <p style=\"font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; margin: 0 0 6px 0;\">Original Inquiry (#{$inquiryId}) &bull; {$originalSubject}</p>
              <div style=\"font-size: 12px; color: #94a3b8; line-height: 1.5;\">
                {$formattedOriginal}
              </div>
            </div>

            <!-- Footer Signature -->
            <div style=\"border-top: 1px solid #232838; padding-top: 20px; font-size: 12px; color: #64748b; line-height: 1.6;\">
              <p style=\"margin: 0; font-weight: 600; color: #94a3b8;\">Best regards,</p>
              <p style=\"margin: 2px 0 12px 0; font-weight: 700; color: #d4af37;\">The Sapphire Trails Concierge &amp; Gemology Team</p>
              <p style=\"margin: 0; font-size: 11px;\">Grand Silver Ray Complex, Colombo - Batticaloa Hwy, Ratnapura, Sri Lanka</p>
              <p style=\"margin: 2px 0 0 0; font-size: 11px;\">Tel: +94 71 235 7700 &bull; reservations@sapphiretrails.lk &bull; www.sapphiretrails.lk</p>
            </div>

          </div>
        </div>";

        return $this->send($guestEmail, $subject, $html, 'inquiry_reply');
    }
}



