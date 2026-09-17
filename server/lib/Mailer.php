<?php

require_once __DIR__ . '/../models/Mail.php';

class Mailer
{
    private $pdo;
    private $mailModel;
    private $settings;
    private $contactDetails = null;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
        $this->mailModel = new Mail($pdo);
        $this->settings = $this->mailModel->getSettings();
    }

    /**
     * Get active contact details from site_content table
     */
    private function getContactDetails()
    {
        if ($this->contactDetails !== null) {
            return $this->contactDetails;
        }

        $default = [
            'whatsapp' => '94763756688',
            'phone' => '+94 76 375 6688',
            'email' => 'info@sapphiretrails.lk'
        ];

        try {
            $stmt = $this->pdo->prepare("SELECT content FROM site_content WHERE section_key = 'contact'");
            $stmt->execute();
            $row = $stmt->fetch(\PDO::FETCH_ASSOC);
            if ($row && !empty($row['content'])) {
                $data = json_decode($row['content'], true);
                if (is_array($data)) {
                    $rawWa = $data['whatsappNumber'] ?? '94763756688';
                    $cleanWa = preg_replace('/\D/', '', $rawWa) ?: '94763756688';
                    $phone = !empty($data['primaryPhone']) ? $data['primaryPhone'] : '+94 76 375 6688';
                    $email = !empty($data['primaryEmail']) ? $data['primaryEmail'] : 'info@sapphiretrails.lk';

                    $this->contactDetails = [
                        'whatsapp' => $cleanWa,
                        'phone' => $phone,
                        'email' => $email
                    ];
                    return $this->contactDetails;
                }
            }
        } catch (\Exception $e) {
            // fallback
        }

        $this->contactDetails = $default;
        return $this->contactDetails;
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
     * Common Sapphire Trails luxury email wrapper matching website theme
     */
    public function wrapEmailTheme($titleBadge, $mainHeading, $bodyContent, $refBadge = null, $actionButtonsHtml = '')
    {
        $contact = $this->getContactDetails();
        $waNum = $contact['whatsapp'];
        $phoneStr = $contact['phone'];
        $emailStr = $contact['email'];
        $year = date('Y');

        return "
        <!DOCTYPE html>
        <html lang=\"en\">
        <head>
          <meta charset=\"UTF-8\">
          <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
          <title>" . htmlspecialchars(strip_tags($mainHeading)) . "</title>
        </head>
        <body style=\"margin: 0; padding: 0; background-color: #F1F5F9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;\">
          <div style=\"background-color: #F1F5F9; padding: 36px 12px; min-height: 100%;\">
            <table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\" style=\"max-width: 620px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(11, 30, 56, 0.08);\">
              
              <!-- Luxury Top Gold Stripe -->
              <tr>
                <td style=\"height: 4px; background: linear-gradient(90deg, #b8860b 0%, #d4af37 35%, #f7e6a1 50%, #d4af37 65%, #b8860b 100%); font-size: 0; line-height: 0;\">&nbsp;</td>
              </tr>

              <!-- Brand Header (Deep Midnight Navy #0B1E38) -->
              <tr>
                <td style=\"background-color: #0B1E38; padding: 24px 30px;\">
                  <table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\">
                    <tr>
                      <td align=\"left\" style=\"vertical-align: middle;\">
                        <table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">
                          <tr>
                            <td style=\"vertical-align: middle; padding-right: 12px;\">
                              <div style=\"width: 40px; height: 40px; border-radius: 10px; background: rgba(212,175,55,0.18); border: 1px solid rgba(212,175,55,0.45); text-align: center; line-height: 40px; font-size: 20px;\">
                                💎
                              </div>
                            </td>
                            <td style=\"vertical-align: middle;\">
                              <span style=\"font-family: 'Playfair Display', Georgia, 'Times New Roman', serif; font-size: 19px; font-weight: 700; letter-spacing: 0.16em; color: #FFFFFF; text-transform: uppercase; display: block;\">SAPPHIRE TRAILS</span>
                              <span style=\"font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: #D4AF37; font-weight: 600; display: block; margin-top: 3px;\">CEYLON GEM EXPEDITIONS &bull; SRI LANKA</span>
                            </td>
                          </tr>
                        </table>
                      </td>
                      " . (!empty($refBadge) ? "
                      <td align=\"right\" style=\"vertical-align: middle;\">
                        <span style=\"display: inline-block; background-color: rgba(255,255,255,0.08); color: #F7E6A1; border: 1px solid rgba(212,175,55,0.35); font-size: 11px; font-weight: 700; padding: 5px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.06em; font-family: monospace;\">
                          {$refBadge}
                        </span>
                      </td>
                      " : "") . "
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Main Card Body -->
              <tr>
                <td style=\"padding: 32px 30px 24px 30px; background-color: #FFFFFF;\">
                  " . (!empty($titleBadge) ? "
                  <div style=\"margin-bottom: 14px;\">
                    {$titleBadge}
                  </div>
                  " : "") . "
                  
                  <h1 style=\"color: #0B1E38; font-size: 22px; font-weight: 700; margin: 0 0 12px 0; font-family: 'Playfair Display', Georgia, serif; line-height: 1.35;\">
                    {$mainHeading}
                  </h1>

                  {$bodyContent}

                  " . (!empty($actionButtonsHtml) ? "
                  <div style=\"margin-top: 28px; text-align: center;\">
                    {$actionButtonsHtml}
                  </div>
                  " : "") . "
                </td>
              </tr>

              <!-- Footer (Deep Midnight Navy #0B1E38 with Gold Trim) -->
              <tr>
                <td style=\"background-color: #0B1E38; border-top: 3px solid #D4AF37; padding: 24px 30px; text-align: center;\">
                  <span style=\"font-family: 'Playfair Display', Georgia, serif; font-size: 14px; font-weight: 700; letter-spacing: 0.12em; color: #FFFFFF; text-transform: uppercase; display: block;\">SAPPHIRE TRAILS SRI LANKA</span>
                  <p style=\"margin: 6px 0 0 0; font-size: 11px; color: #94A3B8; line-height: 1.5;\">
                    Grand Silver Ray Complex, Colombo - Batticaloa Hwy, Ratnapura, Sri Lanka
                  </p>
                  <p style=\"margin: 4px 0 0 0; font-size: 11px; color: #CBD5E1;\">
                    Direct: <a href=\"tel:" . preg_replace('/[^\+0-9]/', '', $phoneStr) . "\" style=\"color: #CBD5E1; text-decoration: none;\">{$phoneStr}</a> &bull; 
                    <a href=\"mailto:{$emailStr}\" style=\"color: #F7E6A1; text-decoration: none;\">{$emailStr}</a> &bull; 
                    <a href=\"https://sapphiretrails.lk\" style=\"color: #F7E6A1; text-decoration: none;\">www.sapphiretrails.lk</a>
                  </p>
                  <div style=\"margin-top: 14px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 10px; color: #64748B;\">
                    NGJA Registered &bull; Certified Private Gem Mine Expeditions &bull; &copy; {$year} Sapphire Trails (Pvt) Ltd.
                  </div>
                </td>
              </tr>

            </table>
          </div>
        </body>
        </html>
        ";
    }

    /**
     * Send Diagnostics Test Email
     */
    public function sendTestEmail($to)
    {
        $badge = "<span style=\"display: inline-block; background-color: #ECFDF5; color: #047857; border: 1px solid #A7F3D0; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em;\">✓ SMTP Connection Operational</span>";
        $heading = "SMTP Mail Server Diagnostics Passed";

        $body = "
        <p style=\"color: #475569; font-size: 14px; line-height: 1.65; margin: 0 0 20px 0;\">
          This is an automated test message from your Sapphire Trails PHP Mail Server. Your SMTP connection settings, TLS/SSL authentication, and luxury HTML email formatting are functioning properly.
        </p>
        <div style=\"background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px 20px; margin-bottom: 20px; font-size: 13px; color: #334155;\">
          <div style=\"padding: 4px 0;\"><strong>SMTP Host:</strong> <span style=\"color: #0B1E38;\">{$this->settings['smtp_host']}</span></div>
          <div style=\"padding: 4px 0;\"><strong>Port:</strong> <span style=\"color: #0B1E38;\">{$this->settings['smtp_port']} ({$this->settings['smtp_encryption']})</span></div>
          <div style=\"padding: 4px 0;\"><strong>Sender Address:</strong> <span style=\"color: #0B1E38;\">{$this->settings['from_email']}</span></div>
          <div style=\"padding: 4px 0;\"><strong>Timestamp:</strong> <span style=\"color: #0B1E38;\">" . date('Y-m-d H:i:s T') . "</span></div>
        </div>
        ";

        $html = $this->wrapEmailTheme($badge, $heading, $body, 'DIAGNOSTICS');
        return $this->send($to, "✅ Sapphire Trails Mail Server Test - " . date('H:i:s'), $html, 'test');
    }

    /**
     * Customer Booking Confirmation Template
     */
    private function renderCustomerBookingTemplate($bookingId, $name, $tourName, $tourDate, $guests, $adults, $children, $totalPrice, $tourImage = '', $tourDuration = '1 Day Expedition', $specialRequests = null)
    {
        $displayImg = $this->resolveFullImageUrl($tourImage);
        $formattedPrice = number_format((float)$totalPrice, 2);
        $contact = $this->getContactDetails();
        $waNum = $contact['whatsapp'];

        $badge = "<span style=\"display: inline-block; background-color: #ECFDF5; color: #047857; border: 1px solid #A7F3D0; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em;\">✓ Reservation Request Received</span>";
        $heading = "Your Expedition Request is Confirmed!";

        $imgHtml = !empty($displayImg) ? "
        <div style=\"margin-bottom: 22px; border-radius: 12px; overflow: hidden; border: 1px solid #E2E8F0;\">
          <img src=\"{$displayImg}\" alt=\"{$tourName}\" width=\"560\" style=\"width: 100%; max-width: 560px; height: 180px; object-fit: cover; display: block;\" />
          <div style=\"padding: 12px 16px; background-color: #F8FAFC; border-top: 1px solid #E2E8F0; display: flex; justify-content: space-between; align-items: center;\">
            <span style=\"font-size: 13px; font-weight: 700; color: #0B1E38;\">{$tourName}</span>
            <span style=\"font-size: 11px; color: #64748B; font-weight: 600;\">⏱ {$tourDuration}</span>
          </div>
        </div>
        " : "";

        $body = "
        <p style=\"color: #475569; font-size: 14px; line-height: 1.65; margin: 0 0 18px 0;\">
          Dear <strong style=\"color: #0B1E38;\">{$name}</strong>, thank you for booking with Sapphire Trails. We have received your reservation inquiry for the <strong style=\"color: #0B1E38;\">{$tourName}</strong>. Our luxury concierge is reviewing pit access and logistics and will confirm your pickup schedule shortly.
        </p>

        {$imgHtml}

        <!-- Booking Details Table -->
        <table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\" style=\"background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px 20px; margin-bottom: 20px;\">
          <tr>
            <td colspan=\"2\" style=\"padding-bottom: 10px; border-bottom: 1px solid #E2E8F0;\">
              <span style=\"font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #B8860B;\">Expedition Summary</span>
            </td>
          </tr>
          <tr>
            <td style=\"padding: 9px 0; color: #64748B; font-size: 13px; border-bottom: 1px solid #EDF2F7; width: 40%;\">Preferred Date:</td>
            <td style=\"padding: 9px 0; text-align: right; color: #0B1E38; font-weight: 600; font-size: 13px; border-bottom: 1px solid #EDF2F7;\">
              📅 {$tourDate} &bull; 9:00 AM
            </td>
          </tr>
          <tr>
            <td style=\"padding: 9px 0; color: #64748B; font-size: 13px; border-bottom: 1px solid #EDF2F7;\">Travelers:</td>
            <td style=\"padding: 9px 0; text-align: right; color: #0B1E38; font-weight: 600; font-size: 13px; border-bottom: 1px solid #EDF2F7;\">
              👥 {$guests} Guest(s) ({$adults} Adults" . ($children > 0 ? ", {$children} Children" : "") . ")
            </td>
          </tr>
          <tr>
            <td style=\"padding: 9px 0; color: #64748B; font-size: 13px; border-bottom: 1px solid #EDF2F7;\">Reservation Status:</td>
            <td style=\"padding: 9px 0; text-align: right; border-bottom: 1px solid #EDF2F7;\">
              <span style=\"color: #92400E; background-color: #FEF3C7; border: 1px solid #FDE68A; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 9999px;\">
                Pending Concierge Review
              </span>
            </td>
          </tr>
          <tr>
            <td style=\"padding: 12px 0 4px 0; color: #64748B; font-size: 13px;\">Estimated Total:</td>
            <td style=\"padding: 12px 0 4px 0; text-align: right;\">
              <span style=\"color: #0B1E38; font-weight: 700; font-size: 18px; font-family: monospace;\">\${$formattedPrice} USD</span>
              <span style=\"display: block; font-size: 10px; color: #64748B; margin-top: 2px;\">(Pay on Arrival / Digital Invoice)</span>
            </td>
          </tr>
        </table>

        " . (!empty($specialRequests) ? "
        <div style=\"background-color: #FEF3C7; border-left: 3px solid #D4AF37; border-radius: 0 8px 8px 0; padding: 12px 16px; margin-bottom: 20px;\">
          <span style=\"color: #92400E; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 4px;\">Vehicle &amp; Special Requests:</span>
          <p style=\"color: #78350F; font-size: 13px; font-style: italic; margin: 0; line-height: 1.5;\">\"" . nl2br(htmlspecialchars($specialRequests)) . "\"</p>
        </div>
        " : "") . "

        <!-- Next Steps -->
        <table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\" style=\"background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px 18px; margin-bottom: 22px;\">
          <tr>
            <td colspan=\"3\" style=\"padding-bottom: 10px; border-bottom: 1px solid #E2E8F0;\">
              <span style=\"font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #B8860B;\">What Happens Next?</span>
            </td>
          </tr>
          <tr>
            <td style=\"padding: 12px 8px 6px 0; vertical-align: top; width: 33%;\">
              <span style=\"display: inline-block; width: 22px; height: 22px; border-radius: 50%; background-color: #0B1E38; color: #FFFFFF; font-weight: 700; font-size: 11px; text-align: center; line-height: 22px; margin-bottom: 6px;\">1</span>
              <p style=\"margin: 0; color: #0B1E38; font-size: 12px; font-weight: 700;\">Concierge Review</p>
              <p style=\"margin: 3px 0 0 0; color: #64748B; font-size: 11px; line-height: 1.4;\">Verification of active mine pit safety.</p>
            </td>
            <td style=\"padding: 12px 8px 6px 8px; vertical-align: top; width: 33%;\">
              <span style=\"display: inline-block; width: 22px; height: 22px; border-radius: 50%; background-color: #0B1E38; color: #FFFFFF; font-weight: 700; font-size: 11px; text-align: center; line-height: 22px; margin-bottom: 6px;\">2</span>
              <p style=\"margin: 0; color: #0B1E38; font-size: 12px; font-weight: 700;\">Confirmed Voucher</p>
              <p style=\"margin: 3px 0 0 0; color: #64748B; font-size: 11px; line-height: 1.4;\">Delivered to your WhatsApp &amp; Email.</p>
            </td>
            <td style=\"padding: 12px 0 6px 8px; vertical-align: top; width: 33%;\">
              <span style=\"display: inline-block; width: 22px; height: 22px; border-radius: 50%; background-color: #0B1E38; color: #FFFFFF; font-weight: 700; font-size: 11px; text-align: center; line-height: 22px; margin-bottom: 6px;\">3</span>
              <p style=\"margin: 0; color: #0B1E38; font-size: 12px; font-weight: 700;\">Expedition Day</p>
              <p style=\"margin: 3px 0 0 0; color: #64748B; font-size: 11px; line-height: 1.4;\">VIP private pickup at your location.</p>
            </td>
          </tr>
        </table>
        ";

        $buttons = "
          <a href=\"https://sapphiretrails.lk/booking/confirmation\" style=\"display: inline-block; background-color: #0B1E38; color: #FFFFFF; font-weight: 600; font-size: 13px; text-decoration: none; padding: 12px 26px; border-radius: 9999px; margin: 4px; box-shadow: 0 4px 12px rgba(11, 30, 56, 0.2);\">
            View Booking Status &rarr;
          </a>
          <a href=\"https://wa.me/{$waNum}?text=" . urlencode("Hello Sapphire Trails Concierge, I am inquiring about my booking #ST-BK-{$bookingId} ({$name}).") . "\" style=\"display: inline-block; background-color: #10B981; color: #FFFFFF; font-weight: 600; font-size: 13px; text-decoration: none; padding: 12px 22px; border-radius: 9999px; margin: 4px;\">
            💬 WhatsApp Concierge (24/7)
          </a>
        ";

        return $this->wrapEmailTheme($badge, $heading, $body, "#ST-BK-{$bookingId}", $buttons);
    }

    /**
     * Admin Booking Notification Template
     */
    private function renderAdminBookingTemplate($bookingId, $name, $email, $phone, $tourName, $tourDate, $guests, $adults, $children, $totalPrice, $message, $tourImage = '', $tourDuration = '1 Day Expedition')
    {
        $displayImg = $this->resolveFullImageUrl($tourImage);
        $formattedPrice = number_format((float)$totalPrice, 2);

        $cleanPhone = preg_replace('/[^0-9]/', '', $phone);
        if (substr($cleanPhone, 0, 1) === '0') {
            $cleanPhone = '94' . substr($cleanPhone, 1);
        }

        $badge = "<span style=\"display: inline-block; background-color: #FEF3C7; color: #B45309; border: 1px solid #FDE68A; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em;\">⚡ Action Required &bull; New Booking Request</span>";
        $heading = "New Expedition Reservation Received";

        $body = "
        <p style=\"color: #475569; font-size: 14px; line-height: 1.65; margin: 0 0 18px 0;\">
          A new guest has submitted a reservation request for <strong style=\"color: #0B1E38;\">{$tourName}</strong>. Please review traveler details and confirm mine safety &amp; vehicle logistics.
        </p>

        <!-- Reservation Parameters Table -->
        <table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\" style=\"background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px 20px; margin-bottom: 18px;\">
          <tr>
            <td colspan=\"2\" style=\"padding-bottom: 10px; border-bottom: 1px solid #E2E8F0;\">
              <span style=\"font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #B8860B;\">Reservation Parameters</span>
            </td>
          </tr>
          <tr>
            <td style=\"padding: 8px 0; color: #64748B; font-size: 13px; width: 40%;\">Tour Requested:</td>
            <td style=\"padding: 8px 0; text-align: right; color: #0B1E38; font-weight: 700; font-size: 13px;\">{$tourName} ({$tourDuration})</td>
          </tr>
          <tr>
            <td style=\"padding: 8px 0; color: #64748B; font-size: 13px;\">Requested Date:</td>
            <td style=\"padding: 8px 0; text-align: right; color: #0B1E38; font-weight: 600; font-size: 13px;\">📅 {$tourDate} &bull; 9:00 AM</td>
          </tr>
          <tr>
            <td style=\"padding: 8px 0; color: #64748B; font-size: 13px;\">Party Size:</td>
            <td style=\"padding: 8px 0; text-align: right; color: #0B1E38; font-weight: 600; font-size: 13px;\">👥 {$guests} Total ({$adults} Adults" . ($children > 0 ? ", {$children} Children" : "") . ")</td>
          </tr>
          <tr>
            <td style=\"padding: 8px 0; color: #64748B; font-size: 13px;\">Estimated Value:</td>
            <td style=\"padding: 8px 0; text-align: right; color: #0B1E38; font-weight: 700; font-size: 15px; font-family: monospace;\">\${$formattedPrice} USD</td>
          </tr>
        </table>

        <!-- Guest Contact Details Table -->
        <table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\" style=\"background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px 20px; margin-bottom: 18px;\">
          <tr>
            <td colspan=\"2\" style=\"padding-bottom: 10px; border-bottom: 1px solid #E2E8F0;\">
              <span style=\"font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #B8860B;\">Guest Contact Information</span>
            </td>
          </tr>
          <tr>
            <td style=\"padding: 7px 0; color: #64748B; font-size: 13px; width: 35%;\">Lead Guest:</td>
            <td style=\"padding: 7px 0; text-align: right; color: #0B1E38; font-weight: 600; font-size: 13px;\">{$name}</td>
          </tr>
          <tr>
            <td style=\"padding: 7px 0; color: #64748B; font-size: 13px;\">Email Address:</td>
            <td style=\"padding: 7px 0; text-align: right; font-size: 13px;\">
              <a href=\"mailto:{$email}\" style=\"color: #1E40AF; text-decoration: none; font-weight: 600;\">{$email}</a>
            </td>
          </tr>
          <tr>
            <td style=\"padding: 7px 0; color: #64748B; font-size: 13px;\">Phone / WhatsApp:</td>
            <td style=\"padding: 7px 0; text-align: right; font-size: 13px;\">
              <a href=\"tel:{$phone}\" style=\"color: #047857; text-decoration: none; font-weight: 600;\">{$phone}</a>
            </td>
          </tr>
        </table>

        " . (!empty($message) ? "
        <div style=\"background-color: #F8FAFC; border-left: 3px solid #0B1E38; border-radius: 0 8px 8px 0; padding: 14px 18px; margin-bottom: 20px;\">
          <span style=\"color: #0B1E38; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 4px;\">Special Requests &amp; Notes:</span>
          <p style=\"color: #334155; font-size: 13px; font-style: italic; margin: 0; line-height: 1.5;\">\"" . nl2br(htmlspecialchars($message)) . "\"</p>
        </div>
        " : "") . "
        ";

        $buttons = "
          <a href=\"https://sapphiretrails.lk/admin/booking-requests\" style=\"display: inline-block; background-color: #0B1E38; color: #FFFFFF; font-weight: 600; font-size: 13px; text-decoration: none; padding: 12px 26px; border-radius: 9999px; margin: 4px; box-shadow: 0 4px 12px rgba(11, 30, 56, 0.2);\">
            Manage in Admin Portal &rarr;
          </a>
          " . (!empty($cleanPhone) ? "
          <a href=\"https://wa.me/{$cleanPhone}?text=" . urlencode("Hello {$name}, thank you for your booking request with Sapphire Trails (#ST-BK-{$bookingId}).") . "\" style=\"display: inline-block; background-color: #10B981; color: #FFFFFF; font-weight: 600; font-size: 13px; text-decoration: none; padding: 12px 22px; border-radius: 9999px; margin: 4px;\">
            💬 Chat with Guest on WhatsApp
          </a>
          " : "") . "
        ";

        return $this->wrapEmailTheme($badge, $heading, $body, "#ST-BK-{$bookingId}", $buttons);
    }

    /**
     * Customer Contact Inquiry Confirmation
     */
    private function renderCustomerContactTemplate($name, $subject)
    {
        $contact = $this->getContactDetails();
        $waNum = $contact['whatsapp'];

        $badge = "<span style=\"display: inline-block; background-color: #ECFDF5; color: #047857; border: 1px solid #A7F3D0; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em;\">✓ Inquiry Received</span>";
        $heading = "Thank You for Contacting Sapphire Trails";

        $body = "
        <p style=\"color: #475569; font-size: 14px; line-height: 1.65; margin: 0 0 18px 0;\">
          Dear <strong style=\"color: #0B1E38;\">{$name}</strong>, thank you for reaching out to us. We have successfully received your inquiry regarding <strong style=\"color: #0B1E38;\">{$subject}</strong>.
        </p>
        <p style=\"color: #475569; font-size: 14px; line-height: 1.65; margin: 0 0 20px 0;\">
          One of our certified gemologist guides and destination specialists will review your requirements and respond within 24 hours. For immediate assistance or bespoke planning, our 24/7 WhatsApp concierge is available.
        </p>
        ";

        $buttons = "
          <a href=\"https://wa.me/{$waNum}\" style=\"display: inline-block; background-color: #10B981; color: #FFFFFF; font-weight: 600; font-size: 13px; text-decoration: none; padding: 12px 26px; border-radius: 9999px; margin: 4px;\">
            💬 WhatsApp Concierge (24/7)
          </a>
          <a href=\"https://sapphiretrails.lk/tours\" style=\"display: inline-block; background-color: #0B1E38; color: #FFFFFF; font-weight: 600; font-size: 13px; text-decoration: none; padding: 12px 26px; border-radius: 9999px; margin: 4px;\">
            Explore Gem Mine Tours &rarr;
          </a>
        ";

        return $this->wrapEmailTheme($badge, $heading, $body, 'INQUIRY', $buttons);
    }

    /**
     * Admin Contact Inquiry Notification
     */
    private function renderAdminContactTemplate($contactId, $name, $email, $phone, $subject, $message)
    {
        $cleanPhone = preg_replace('/[^0-9]/', '', $phone);
        if (substr($cleanPhone, 0, 1) === '0') {
            $cleanPhone = '94' . substr($cleanPhone, 1);
        }

        $badge = "<span style=\"display: inline-block; background-color: #EFF6FF; color: #1E40AF; border: 1px solid #BFDBFE; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em;\">📬 New Message Received</span>";
        $heading = "New Website Inquiry: " . htmlspecialchars($subject);

        $body = "
        <table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\" style=\"background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px 20px; margin-bottom: 20px;\">
          <tr>
            <td colspan=\"2\" style=\"padding-bottom: 10px; border-bottom: 1px solid #E2E8F0;\">
              <span style=\"font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #B8860B;\">Inquiry Sender Details</span>
            </td>
          </tr>
          <tr>
            <td style=\"padding: 8px 0; color: #64748B; font-size: 13px; width: 30%;\">From:</td>
            <td style=\"padding: 8px 0; color: #0B1E38; font-weight: 600; font-size: 13px;\">{$name}</td>
          </tr>
          <tr>
            <td style=\"padding: 8px 0; color: #64748B; font-size: 13px;\">Email:</td>
            <td style=\"padding: 8px 0; font-size: 13px;\"><a href=\"mailto:{$email}\" style=\"color: #1E40AF; text-decoration: none; font-weight: 600;\">{$email}</a></td>
          </tr>
          <tr>
            <td style=\"padding: 8px 0; color: #64748B; font-size: 13px;\">Phone:</td>
            <td style=\"padding: 8px 0; font-size: 13px;\"><a href=\"tel:{$phone}\" style=\"color: #047857; text-decoration: none; font-weight: 600;\">{$phone}</a></td>
          </tr>
        </table>

        <div style=\"background-color: #FFFFFF; border: 1px solid #E2E8F0; border-left: 3px solid #0B1E38; border-radius: 0 8px 8px 0; padding: 16px 20px; margin-bottom: 20px;\">
          <span style=\"color: #64748B; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 6px;\">Inquiry Message:</span>
          <div style=\"color: #334155; font-size: 13px; line-height: 1.6;\">" . nl2br(htmlspecialchars($message)) . "</div>
        </div>
        ";

        $buttons = "
          <a href=\"mailto:{$email}?subject=" . urlencode("Re: Sapphire Trails Inquiry #{$contactId} - {$subject}") . "\" style=\"display: inline-block; background-color: #0B1E38; color: #FFFFFF; font-weight: 600; font-size: 13px; text-decoration: none; padding: 12px 24px; border-radius: 9999px; margin: 4px;\">
            Reply via Email &rarr;
          </a>
          " . (!empty($cleanPhone) ? "
          <a href=\"https://wa.me/{$cleanPhone}?text=" . urlencode("Hello {$name}, regarding your Sapphire Trails inquiry #{$contactId}...") . "\" style=\"display: inline-block; background-color: #10B981; color: #FFFFFF; font-weight: 600; font-size: 13px; text-decoration: none; padding: 12px 22px; border-radius: 9999px; margin: 4px;\">
            💬 WhatsApp Guest
          </a>
          " : "") . "
          <a href=\"https://sapphiretrails.lk/admin/contact-submissions\" style=\"display: inline-block; background-color: #F1F5F9; color: #0B1E38; border: 1px solid #CBD5E1; font-weight: 600; font-size: 13px; text-decoration: none; padding: 12px 22px; border-radius: 9999px; margin: 4px;\">
            View in Dashboard
          </a>
        ";

        return $this->wrapEmailTheme($badge, $heading, $body, "#INQ-{$contactId}", $buttons);
    }

    /**
     * Customer Bespoke Proposal Confirmation
     */
    private function renderCustomerProposalTemplate($name, $tourInterest)
    {
        $contact = $this->getContactDetails();
        $waNum = $contact['whatsapp'];

        $badge = "<span style=\"display: inline-block; background-color: #FEF3C7; color: #B45309; border: 1px solid #FDE68A; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em;\">💎 Bespoke Proposal Request Received</span>";
        $heading = "Crafting Your Tailored Ceylon Expedition";

        $body = "
        <p style=\"color: #475569; font-size: 14px; line-height: 1.65; margin: 0 0 16px 0;\">
          Dear <strong style=\"color: #0B1E38;\">{$name}</strong>, thank you for your bespoke expedition inquiry for <strong style=\"color: #0B1E38;\">{$tourInterest}</strong>.
        </p>
        <p style=\"color: #475569; font-size: 14px; line-height: 1.65; margin: 0 0 20px 0;\">
          Our luxury travel curators and Senior Geologists are currently designing a custom private itinerary tailored to your schedule, preferences, and private mine access. We will present your custom proposal shortly.
        </p>
        ";

        $buttons = "
          <a href=\"https://wa.me/{$waNum}\" style=\"display: inline-block; background-color: #10B981; color: #FFFFFF; font-weight: 600; font-size: 13px; text-decoration: none; padding: 12px 26px; border-radius: 9999px; margin: 4px;\">
            💬 WhatsApp Concierge (24/7)
          </a>
        ";

        return $this->wrapEmailTheme($badge, $heading, $body, 'PROPOSAL', $buttons);
    }

    /**
     * Admin Bespoke Proposal Notification
     */
    private function renderAdminProposalTemplate($name, $email, $phone, $tourInterest, $dates, $partySize, $requirements)
    {
        $cleanPhone = preg_replace('/[^0-9]/', '', $phone);
        if (substr($cleanPhone, 0, 1) === '0') {
            $cleanPhone = '94' . substr($cleanPhone, 1);
        }

        $badge = "<span style=\"display: inline-block; background-color: #FEF3C7; color: #B45309; border: 1px solid #FDE68A; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em;\">💎 High-Value Lead &bull; Bespoke Proposal</span>";
        $heading = "New Proposal Request: {$tourInterest}";

        $body = "
        <table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\" style=\"background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px 20px; margin-bottom: 20px;\">
          <tr>
            <td colspan=\"2\" style=\"padding-bottom: 10px; border-bottom: 1px solid #E2E8F0;\">
              <span style=\"font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #B8860B;\">Client Proposal Parameters</span>
            </td>
          </tr>
          <tr><td style=\"padding: 7px 0; color: #64748B; font-size: 13px; width: 35%;\">Client:</td><td style=\"padding: 7px 0; color: #0B1E38; font-weight: 600; font-size: 13px;\">{$name}</td></tr>
          <tr><td style=\"padding: 7px 0; color: #64748B; font-size: 13px;\">Email:</td><td style=\"padding: 7px 0; font-size: 13px;\"><a href=\"mailto:{$email}\" style=\"color: #1E40AF; text-decoration: none; font-weight: 600;\">{$email}</a></td></tr>
          <tr><td style=\"padding: 7px 0; color: #64748B; font-size: 13px;\">Phone:</td><td style=\"padding: 7px 0; font-size: 13px;\"><a href=\"tel:{$phone}\" style=\"color: #047857; text-decoration: none; font-weight: 600;\">{$phone}</a></td></tr>
          <tr><td style=\"padding: 7px 0; color: #64748B; font-size: 13px;\">Preferred Dates:</td><td style=\"padding: 7px 0; color: #0B1E38; font-weight: 600; font-size: 13px;\">{$dates}</td></tr>
          <tr><td style=\"padding: 7px 0; color: #64748B; font-size: 13px;\">Party Size:</td><td style=\"padding: 7px 0; color: #0B1E38; font-weight: 600; font-size: 13px;\">{$partySize}</td></tr>
        </table>

        <div style=\"background-color: #FFFFFF; border: 1px solid #E2E8F0; border-left: 3px solid #D4AF37; border-radius: 0 8px 8px 0; padding: 16px 20px; margin-bottom: 20px;\">
          <span style=\"color: #B8860B; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 6px;\">Special Requirements:</span>
          <div style=\"color: #334155; font-size: 13px; line-height: 1.6;\">" . nl2br(htmlspecialchars($requirements)) . "</div>
        </div>
        ";

        $buttons = "
          <a href=\"mailto:{$email}?subject=" . urlencode("Sapphire Trails - Bespoke Tour Proposal for {$tourInterest}") . "\" style=\"display: inline-block; background-color: #0B1E38; color: #FFFFFF; font-weight: 600; font-size: 13px; text-decoration: none; padding: 12px 24px; border-radius: 9999px; margin: 4px;\">
            Reply to Client &rarr;
          </a>
          " . (!empty($cleanPhone) ? "
          <a href=\"https://wa.me/{$cleanPhone}\" style=\"display: inline-block; background-color: #10B981; color: #FFFFFF; font-weight: 600; font-size: 13px; text-decoration: none; padding: 12px 22px; border-radius: 9999px; margin: 4px;\">
            💬 WhatsApp Client
          </a>
          " : "") . "
        ";

        return $this->wrapEmailTheme($badge, $heading, $body, 'PROPOSAL LEAD', $buttons);
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
            $formattedNewDate .= " to " . date('F d, Y', strtotime($newEndDate));
        }

        $invoiceLink = !empty($invoice['invoice_number']) 
            ? "https://sapphiretrails.lk/invoices/{$invoice['invoice_number']}" 
            : "https://sapphiretrails.lk/booking/confirmation";

        $html = $this->renderRescheduleTemplate($bookingId, $name, $tourTitle, $formattedOldDate, $formattedNewDate, $guests, $reason, $invoiceLink);
        return $this->send($email, "📅 Tour Dates Updated & Confirmed - Sapphire Trails (#ST-BK-{$bookingId})", $html, 'reschedule_confirmation');
    }

    private function renderRescheduleTemplate($bookingId, $name, $tourTitle, $oldDate, $newDate, $guests, $reason, $invoiceLink)
    {
        $badge = "<span style=\"display: inline-block; background-color: #ECFDF5; color: #047857; border: 1px solid #A7F3D0; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em;\">✓ Tour Dates Updated &amp; Confirmed</span>";
        $heading = "Your Tour Dates Have Been Updated";

        $body = "
        <p style=\"color: #475569; font-size: 14px; line-height: 1.65; margin: 0 0 18px 0;\">
          Dear <strong style=\"color: #0B1E38;\">{$name}</strong>, your reservation schedule for <strong style=\"color: #0B1E38;\">{$tourTitle}</strong> has been successfully updated in our system.
        </p>

        <!-- Date Change Comparison Table -->
        <table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\" style=\"background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px 20px; margin-bottom: 20px;\">
          <tr style=\"border-bottom: 1px solid #EDF2F7;\">
            <td style=\"padding: 9px 0; color: #64748B; font-size: 13px; width: 40%;\">Previous Date:</td>
            <td style=\"padding: 9px 0; text-align: right; color: #EF4444; font-size: 13px; text-decoration: line-through;\">{$oldDate}</td>
          </tr>
          <tr style=\"border-bottom: 1px solid #EDF2F7;\">
            <td style=\"padding: 10px 0; color: #0B1E38; font-weight: 700; font-size: 13px;\">New Confirmed Date:</td>
            <td style=\"padding: 10px 0; text-align: right; color: #047857; font-weight: 700; font-size: 15px;\">{$newDate}</td>
          </tr>
          <tr>
            <td style=\"padding: 9px 0; color: #64748B; font-size: 13px;\">Travelers:</td>
            <td style=\"padding: 9px 0; text-align: right; color: #0B1E38; font-weight: 600; font-size: 13px;\">{$guests} Guest(s)</td>
          </tr>
        </table>

        " . (!empty($reason) ? "
        <div style=\"background-color: #FEF3C7; border-left: 3px solid #D4AF37; border-radius: 0 8px 8px 0; padding: 14px 18px; margin-bottom: 22px;\">
          <span style=\"color: #92400E; font-size: 11px; font-weight: 700; text-transform: uppercase;\">Reschedule Notes:</span>
          <p style=\"margin: 4px 0 0 0; font-size: 13px; color: #78350F; font-style: italic;\">\"" . htmlspecialchars($reason) . "\"</p>
        </div>
        " : "") . "
        ";

        $buttons = "
          <a href=\"{$invoiceLink}\" style=\"display: inline-block; background-color: #0B1E38; color: #FFFFFF; font-weight: 600; font-size: 13px; text-decoration: none; padding: 12px 28px; border-radius: 9999px; margin: 4px; box-shadow: 0 4px 12px rgba(11, 30, 56, 0.2);\">
            View Updated Details &rarr;
          </a>
        ";

        return $this->wrapEmailTheme($badge, $heading, $body, "#ST-BK-{$bookingId}", $buttons);
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
            <tr style=\"border-bottom: 1px solid #EDF2F7;\">
              <td style=\"padding: 10px 8px; color: #0B1E38; font-size: 13px; font-weight: 500;\">{$desc}</td>
              <td style=\"padding: 10px 8px; text-align: center; color: #64748B; font-size: 13px;\">{$lineQty}</td>
              <td style=\"padding: 10px 8px; text-align: right; color: #64748B; font-size: 13px;\">{$currency} {$unitP}</td>
              <td style=\"padding: 10px 8px; text-align: right; color: #0B1E38; font-weight: 700; font-size: 13px;\">{$currency} {$totalP}</td>
            </tr>";
        }

        $viewUrl = "https://sapphiretrails.lk/invoices/{$invoiceNumber}";
        $statusBadgeColor = $paymentStatus === 'paid' ? '#ECFDF5; color: #047857; border: 1px solid #A7F3D0;' : ($paymentStatus === 'partially_paid' ? '#EFF6FF; color: #1E40AF; border: 1px solid #BFDBFE;' : '#FEF3C7; color: #B45309; border: 1px solid #FDE68A;');
        $statusText = strtoupper(str_replace('_', ' ', $paymentStatus));

        $badge = "<span style=\"display: inline-block; background-color: {$statusBadgeColor} font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em;\">● Payment {$statusText}</span>";
        $heading = "Official Expedition Invoice {$invoiceNumber}";

        $body = "
        <div style=\"margin-bottom: 20px; font-size: 13px; color: #64748B;\">
          <p style=\"margin: 0; color: #475569;\">Billed to: <strong style=\"color: #0B1E38;\">{$customerName}</strong> ({$customerEmail})</p>
          <p style=\"margin: 4px 0 0 0;\">Tour Date: <strong style=\"color: #0B1E38;\">{$tourDate}</strong> &bull; Due: <strong style=\"color: #0B1E38;\">{$dueDate}</strong></p>
        </div>

        <!-- Itemized Table -->
        <table style=\"width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;\">
          <thead>
            <tr style=\"background-color: #F8FAFC; border-bottom: 2px solid #E2E8F0;\">
              <th style=\"padding: 10px 8px; text-align: left; color: #64748B; font-weight: 700; font-size: 11px; text-transform: uppercase;\">Item Description</th>
              <th style=\"padding: 10px 8px; text-align: center; color: #64748B; font-weight: 700; font-size: 11px; text-transform: uppercase; width: 50px;\">Qty</th>
              <th style=\"padding: 10px 8px; text-align: right; color: #64748B; font-weight: 700; font-size: 11px; text-transform: uppercase; width: 100px;\">Rate</th>
              <th style=\"padding: 10px 8px; text-align: right; color: #64748B; font-weight: 700; font-size: 11px; text-transform: uppercase; width: 100px;\">Total</th>
            </tr>
          </thead>
          <tbody>
            {$itemsHtml}
          </tbody>
        </table>

        <!-- Totals Summary -->
        <table style=\"width: 100%; background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px 20px; margin-bottom: 20px; font-size: 13px;\">
          <tr>
            <td style=\"padding: 6px 0; color: #64748B;\">Subtotal:</td>
            <td style=\"padding: 6px 0; text-align: right; color: #0B1E38; font-weight: 600;\">{$currency} " . number_format(floatval($invoice['subtotal']), 2) . "</td>
          </tr>
          " . (floatval($invoice['discount_amount']) > 0 ? "
          <tr>
            <td style=\"padding: 6px 0; color: #047857;\">Discount:</td>
            <td style=\"padding: 6px 0; text-align: right; color: #047857; font-weight: 600;\">- {$currency} " . number_format(floatval($invoice['discount_amount']), 2) . "</td>
          </tr>" : "") . "
          " . (floatval($invoice['tax_amount']) > 0 ? "
          <tr>
            <td style=\"padding: 6px 0; color: #64748B;\">Taxes &amp; Service:</td>
            <td style=\"padding: 6px 0; text-align: right; color: #0B1E38;\">+ {$currency} " . number_format(floatval($invoice['tax_amount']), 2) . "</td>
          </tr>" : "") . "
          <tr style=\"border-top: 2px solid #E2E8F0;\">
            <td style=\"padding: 10px 0 0 0; color: #0B1E38; font-size: 15px; font-weight: 700;\">Total Amount:</td>
            <td style=\"padding: 10px 0 0 0; text-align: right; color: #0B1E38; font-size: 18px; font-weight: 700; font-family: monospace;\">{$currency} " . number_format($totalAmount, 2) . "</td>
          </tr>
          <tr>
            <td style=\"padding: 6px 0 0 0; color: #64748B;\">Balance Due:</td>
            <td style=\"padding: 6px 0 0 0; text-align: right; color: " . (floatval($invoice['balance_due']) > 0 ? '#B45309' : '#047857') . "; font-weight: 700;\">{$currency} " . number_format(floatval($invoice['balance_due']), 2) . "</td>
          </tr>
        </table>

        " . (!empty($invoice['bank_details']) ? "
        <div style=\"background-color: #F8FAFC; border: 1px dashed #CBD5E1; border-radius: 10px; padding: 16px; margin-bottom: 22px;\">
          <span style=\"color: #0B1E38; font-size: 11px; font-weight: 700; text-transform: uppercase;\">Payment Instructions / Bank Details</span>
          <p style=\"margin: 6px 0 0 0; font-size: 12px; color: #475569; line-height: 1.6;\">" . nl2br(htmlspecialchars($invoice['bank_details'])) . "</p>
        </div>
        " : "") . "
        ";

        $buttons = "
          <a href=\"{$viewUrl}\" style=\"display: inline-block; background-color: #0B1E38; color: #FFFFFF; font-weight: 600; font-size: 13px; text-decoration: none; padding: 12px 30px; border-radius: 9999px; margin: 4px; box-shadow: 0 4px 12px rgba(11, 30, 56, 0.2);\">
            View &amp; Print Full Invoice &rarr;
          </a>
        ";

        $html = $this->wrapEmailTheme($badge, $heading, $body, $invoiceNumber, $buttons);
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

        $invoiceNumber = $booking['invoice_number'] ?? null;
        $invoiceUrl    = $invoiceNumber ? "https://sapphiretrails.lk/invoices/{$invoiceNumber}" : "https://sapphiretrails.lk/booking/confirmation";

        $contact = $this->getContactDetails();
        $waNum = $contact['whatsapp'];

        $badge = "<span style=\"display: inline-block; background-color: #ECFDF5; color: #047857; border: 1px solid #A7F3D0; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em;\">✓ Booking Confirmed &amp; Accepted</span>";
        $heading = "Your Expedition is Confirmed, {$guestName}!";

        $body = "
        <p style=\"color: #475569; font-size: 14px; line-height: 1.65; margin: 0 0 18px 0;\">
          We are delighted to confirm your private gem mining reservation. Our Senior Geologist and concierge team are preparing an exclusive, authentic expedition for your party.
        </p>

        <!-- Confirmed Details Table -->
        <table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" width=\"100%\" style=\"background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px 20px; margin-bottom: 20px;\">
          <tr>
            <td colspan=\"2\" style=\"padding-bottom: 10px; border-bottom: 1px solid #E2E8F0;\">
              <span style=\"font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #B8860B;\">Confirmed Reservation Details</span>
            </td>
          </tr>
          <tr><td style=\"padding: 8px 0; color: #64748B; font-size: 13px; width: 40%;\">Tour Package:</td><td style=\"padding: 8px 0; text-align: right; color: #0B1E38; font-weight: 700; font-size: 13px;\">{$tourName}</td></tr>
          <tr><td style=\"padding: 8px 0; color: #64748B; font-size: 13px;\">Confirmed Date:</td><td style=\"padding: 8px 0; text-align: right; color: #047857; font-weight: 700; font-size: 14px;\">{$dateStr}</td></tr>
          <tr><td style=\"padding: 8px 0; color: #64748B; font-size: 13px;\">Party Size:</td><td style=\"padding: 8px 0; text-align: right; color: #0B1E38; font-weight: 600; font-size: 13px;\">{$guests} Traveler(s) ({$adults} Adults" . ($children > 0 ? ", {$children} Children" : "") . ")</td></tr>
        </table>

        <!-- Inclusions Box -->
        <div style=\"background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px; margin-bottom: 22px;\">
          <h4 style=\"color: #0B1E38; font-size: 13px; margin: 0 0 10px 0;\">💎 What&apos;s Included in Your Private Tour:</h4>
          <ul style=\"margin: 0; padding-left: 18px; font-size: 13px; color: #475569; line-height: 1.8;\">
            <li>Private air-conditioned vehicle transport across all sites.</li>
            <li>Exclusive private access to active traditional gem mining shafts in Ratnapura.</li>
            <li>Hands-on gem panning &amp; washing experience in mineral-rich riverbeds.</li>
            <li>Expert licensed gemologist guidance &amp; rough sapphire valuation workshop.</li>
            <li>Underground safety helmets, boots, and illumination equipment provided.</li>
            <li>Complimentary Ceylon tea &amp; refreshments.</li>
          </ul>
        </div>
        ";

        $buttons = "
          " . ($invoiceNumber ? "
          <a href=\"{$invoiceUrl}\" style=\"display: inline-block; background-color: #0B1E38; color: #FFFFFF; font-weight: 600; font-size: 13px; text-decoration: none; padding: 12px 28px; border-radius: 9999px; margin: 4px; box-shadow: 0 4px 12px rgba(11, 30, 56, 0.2);\">
            View Digital Invoice &rarr;
          </a>
          " : "") . "
          <a href=\"https://wa.me/{$waNum}?text=" . urlencode("Hello Sapphire Trails, I am inquiring about my confirmed booking #ST-BK-{$bookingId} ({$guestName}).") . "\" style=\"display: inline-block; background-color: #10B981; color: #FFFFFF; font-weight: 600; font-size: 13px; text-decoration: none; padding: 12px 22px; border-radius: 9999px; margin: 4px;\">
            💬 WhatsApp Concierge (24/7)
          </a>
        ";

        $html = $this->wrapEmailTheme($badge, $heading, $body, "#ST-BK-{$bookingId}", $buttons);
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

        $contactDetails = $this->getContactDetails();
        $waNum = $contactDetails['whatsapp'];

        $formattedReply = nl2br(htmlspecialchars($replyMessage));
        $formattedOriginal = nl2br(htmlspecialchars($originalMessage));

        $badge = "<span style=\"display: inline-block; background-color: #EFF6FF; color: #1E40AF; border: 1px solid #BFDBFE; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em;\">Concierge Response</span>";
        $heading = "Regarding Your Inquiry";

        $body = "
        <p style=\"font-size: 15px; font-weight: 600; color: #0B1E38; margin: 0 0 12px 0;\">Dear {$guestName},</p>
        <div style=\"font-size: 14px; line-height: 1.75; color: #334155; margin-bottom: 24px;\">
          {$formattedReply}
        </div>

        <!-- Original Inquiry Reference -->
        <div style=\"background-color: #F8FAFC; border-left: 3px solid #64748B; border-radius: 0 8px 8px 0; padding: 14px 18px; margin-bottom: 22px;\">
          <p style=\"font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748B; margin: 0 0 6px 0;\">Original Inquiry (#{$inquiryId}) &bull; {$originalSubject}</p>
          <div style=\"font-size: 12px; color: #475569; line-height: 1.5;\">
            {$formattedOriginal}
          </div>
        </div>
        ";

        $buttons = "
          <a href=\"https://wa.me/{$waNum}?text=" . urlencode("Hello Sapphire Trails, I am following up on inquiry #{$inquiryId} ({$guestName}).") . "\" style=\"display: inline-block; background-color: #10B981; color: #FFFFFF; font-weight: 600; font-size: 13px; text-decoration: none; padding: 12px 24px; border-radius: 9999px; margin: 4px;\">
            💬 Chat with our Concierge on WhatsApp
          </a>
        ";

        $html = $this->wrapEmailTheme($badge, $heading, $body, "#INQ-{$inquiryId}", $buttons);
        return $this->send($guestEmail, $subject, $html, 'inquiry_reply');
    }
}
