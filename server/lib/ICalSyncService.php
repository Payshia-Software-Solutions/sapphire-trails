<?php

class ICalSyncService
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    /**
     * Generate RFC 5545 .ics Calendar Feed for a Tour Package
     */
    public function generateExportIcs($tourPackageId)
    {
        // Get Tour Package info
        $pkgStmt = $this->pdo->prepare("SELECT id, homepage_title FROM tour_packages WHERE id = ?");
        $pkgStmt->execute([$tourPackageId]);
        $package = $pkgStmt->fetch(PDO::FETCH_ASSOC);
        $pkgTitle = $package ? $package['homepage_title'] : "Package #{$tourPackageId}";

        // Get confirmed and pending bookings for this package
        $stmt = $this->pdo->prepare("
            SELECT b.*, u.name AS user_name, u.email AS user_email
            FROM bookings b
            LEFT JOIN users u ON b.user_id = u.id
            WHERE b.tour_package_id = ? AND b.status NOT IN ('rejected', 'cancelled')
            ORDER BY b.tour_date ASC
        ");
        $stmt->execute([$tourPackageId]);
        $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $calName = "Sapphire Trails - " . preg_replace('/[^A-Za-z0-9 _-]/', '', $pkgTitle);
        $nowUtc = gmdate('Ymd\THis\Z');

        $ics = [];
        $ics[] = "BEGIN:VCALENDAR";
        $ics[] = "VERSION:2.0";
        $ics[] = "PRODID:-//Sapphire Trails//Booking System//EN";
        $ics[] = "CALSCALE:GREGORIAN";
        $ics[] = "METHOD:PUBLISH";
        $ics[] = "X-WR-CALNAME:" . $calName;
        $ics[] = "X-WR-TIMEZONE:Asia/Colombo";

        foreach ($bookings as $b) {
            $bookingId = $b['id'];
            $uid = "sapphire-booking-{$bookingId}@sapphiretrails.com";
            
            // Format dates
            $startDate = !empty($b['tour_date']) ? date('Ymd', strtotime($b['tour_date'])) : date('Ymd');
            if (!empty($b['end_date'])) {
                // In iCalendar, DTEND for full day event is non-inclusive (day after)
                $endDate = date('Ymd', strtotime($b['end_date'] . ' +1 day'));
            } else {
                $endDate = date('Ymd', strtotime($b['tour_date'] . ' +1 day'));
            }

            $guestName = !empty($b['name']) ? $b['name'] : (!empty($b['user_name']) ? $b['user_name'] : "Guest");
            $summary = "Reserved - " . $guestName . " (" . ($b['guests'] ?? 1) . " guests)";
            $description = "Sapphire Trails Booking #" . $bookingId . "\\nStatus: " . ucfirst($b['status']) . "\\nSource: " . ($b['booking_source'] ?? 'website');

            $ics[] = "BEGIN:VEVENT";
            $ics[] = "UID:" . $uid;
            $ics[] = "DTSTAMP:" . $nowUtc;
            $ics[] = "DTSTART;VALUE=DATE:" . $startDate;
            $ics[] = "DTEND;VALUE=DATE:" . $endDate;
            $ics[] = "SUMMARY:" . $summary;
            $ics[] = "DESCRIPTION:" . $description;
            $ics[] = "STATUS:CONFIRMED";
            $ics[] = "END:VEVENT";
        }

        $ics[] = "END:VCALENDAR";

        return implode("\r\n", $ics);
    }

    /**
     * Fetch and synchronize an external iCal feed (Airbnb, Booking.com, Agoda)
     */
    public function syncFeed($feedId)
    {
        $feedStmt = $this->pdo->prepare("SELECT * FROM package_ical_feeds WHERE id = ?");
        $feedStmt->execute([$feedId]);
        $feed = $feedStmt->fetch(PDO::FETCH_ASSOC);

        if (!$feed) {
            throw new Exception("Feed not found with ID: {$feedId}");
        }

        $url = trim($feed['feed_url']);
        if (empty($url)) {
            throw new Exception("Feed URL is empty.");
        }

        // Fetch .ics content via cURL
        $content = $this->fetchRemoteContent($url);
        if (!$content) {
            $errorMsg = "Unable to fetch calendar feed from URL. Please check if the URL is active.";
            $this->updateFeedStatus($feedId, 'error', $errorMsg);
            throw new Exception($errorMsg);
        }

        $events = $this->parseIcsEvents($content);
        $packageId = $feed['tour_package_id'];
        $platform = strtolower($feed['platform'] ?? 'other');

        $stats = [
            'total_events' => count($events),
            'created' => 0,
            'updated' => 0,
            'skipped' => 0
        ];

        foreach ($events as $ev) {
            $uid = $ev['uid'] ?? null;
            if (!$uid) {
                $stats['skipped']++;
                continue;
            }

            // Don't import our own exported events if looped
            if (strpos($uid, 'sapphire-booking-') !== false) {
                $stats['skipped']++;
                continue;
            }

            $startDate = $ev['start_date'] ?? null;
            $endDate = $ev['end_date'] ?? null;
            if (!$startDate) {
                $stats['skipped']++;
                continue;
            }

            $summary = $ev['summary'] ?? "OTA Reservation";
            $description = $ev['description'] ?? "";
            $status = ($ev['status'] === 'CANCELLED') ? 'rejected' : 'confirmed';

            // Check if booking with this external_booking_id exists
            $checkStmt = $this->pdo->prepare("SELECT id, status, tour_date, end_date FROM bookings WHERE external_booking_id = ?");
            $checkStmt->execute([$uid]);
            $existing = $checkStmt->fetch(PDO::FETCH_ASSOC);

            if ($existing) {
                // Update existing booking
                $upStmt = $this->pdo->prepare("
                    UPDATE bookings 
                    SET tour_date = ?, 
                        end_date = ?, 
                        status = ?, 
                        message = ?, 
                        tour_package_id = ?,
                        updated_at = NOW()
                    WHERE id = ?
                ");
                $upStmt->execute([
                    $startDate,
                    $endDate,
                    $status,
                    $summary . ($description ? "\n" . $description : ""),
                    $packageId,
                    $existing['id']
                ]);
                $stats['updated']++;
            } else {
                // Insert new booking
                $guestName = $this->extractGuestName($summary, $platform);
                $insStmt = $this->pdo->prepare("
                    INSERT INTO bookings (
                        user_id, tour_package_id, name, email, phone, adults, children, guests,
                        tour_date, end_date, status, booking_source, external_booking_id, message, created_at, updated_at
                    ) VALUES (
                        NULL, ?, ?, ?, NULL, 1, 0, 1,
                        ?, ?, ?, ?, ?, ?, NOW(), NOW()
                    )
                ");
                $insStmt->execute([
                    $packageId,
                    $guestName,
                    "ota-sync@" . $platform . ".local",
                    $startDate,
                    $endDate,
                    $status,
                    $platform,
                    $uid,
                    $summary . ($description ? "\n" . $description : "")
                ]);
                $stats['created']++;
            }
        }

        $this->updateFeedStatus($feedId, 'success', null);
        return $stats;
    }

    /**
     * Synchronize all feeds for a tour package or all packages
     */
    public function syncAllFeeds($packageId = null)
    {
        if ($packageId) {
            $stmt = $this->pdo->prepare("SELECT id FROM package_ical_feeds WHERE tour_package_id = ?");
            $stmt->execute([$packageId]);
        } else {
            $stmt = $this->pdo->query("SELECT id FROM package_ical_feeds");
        }

        $feeds = $stmt->fetchAll(PDO::FETCH_COLUMN);
        $totalStats = ['total_feeds' => count($feeds), 'created' => 0, 'updated' => 0, 'errors' => []];

        foreach ($feeds as $fId) {
            try {
                $res = $this->syncFeed($fId);
                $totalStats['created'] += $res['created'];
                $totalStats['updated'] += $res['updated'];
            } catch (Exception $e) {
                $totalStats['errors'][] = "Feed #{$fId}: " . $e->getMessage();
            }
        }

        return $totalStats;
    }

    private function updateFeedStatus($feedId, $status, $errorMsg = null)
    {
        $stmt = $this->pdo->prepare("
            UPDATE package_ical_feeds 
            SET sync_status = ?, last_error_message = ?, last_synced_at = NOW(), updated_at = NOW()
            WHERE id = ?
        ");
        $stmt->execute([$status, $errorMsg, $feedId]);
    }

    /**
     * Validate URL against SSRF (no local/private IPs allowed)
     */
    private function validateSafeUrl($url): bool
    {
        $parsed = parse_url($url);
        if (!$parsed || !isset($parsed['scheme'], $parsed['host'])) {
            return false;
        }

        $scheme = strtolower($parsed['scheme']);
        if (!in_array($scheme, ['http', 'https'], true)) {
            return false;
        }

        $host = $parsed['host'];
        if ($host === 'localhost' || $host === '127.0.0.1' || $host === '::1') {
            return false;
        }

        $ips = @gethostbynamel($host);
        if ($ips === false) {
            return false;
        }

        foreach ($ips as $ip) {
            // Reject private, loopback, and reserved IP ranges
            if (!filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Fetch remote URL using cURL with User-Agent & SSL checks
     */
    private function fetchRemoteContent($url)
    {
        if (!$this->validateSafeUrl($url)) {
            error_log("SSRF Warning: Blocked unsafe or private URL request to '$url'");
            return false;
        }

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_MAXREDIRS, 5);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SapphireTrails/1.0 iCal-Sync');
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode >= 200 && $httpCode < 300 && !empty($response)) {
            return $response;
        }

        return false;
    }

    /**
     * Parse raw ICS content into structured event arrays
     */
    private function parseIcsEvents($icsContent)
    {
        // Unfold multi-line entries (RFC 5545 section 3.1)
        $icsContent = preg_replace("/\r\n[ \t]/", "", $icsContent);
        $icsContent = preg_replace("/\n[ \t]/", "", $icsContent);

        $lines = preg_split("/\r\n|\n|\r/", $icsContent);
        $events = [];
        $insideEvent = false;
        $currentEvent = [];

        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) continue;

            if (strtoupper($line) === 'BEGIN:VEVENT') {
                $insideEvent = true;
                $currentEvent = [
                    'uid' => null,
                    'start_date' => null,
                    'end_date' => null,
                    'summary' => '',
                    'description' => '',
                    'status' => 'CONFIRMED'
                ];
                continue;
            }

            if (strtoupper($line) === 'END:VEVENT') {
                if ($insideEvent && !empty($currentEvent['uid'])) {
                    $events[] = $currentEvent;
                }
                $insideEvent = false;
                $currentEvent = [];
                continue;
            }

            if ($insideEvent) {
                if (preg_match('/^UID:(.+)$/i', $line, $m)) {
                    $currentEvent['uid'] = trim($m[1]);
                } elseif (preg_match('/^DTSTART(?:;[^:]+)?:([0-9TZ]+)$/i', $line, $m)) {
                    $currentEvent['start_date'] = $this->formatIcsDate(trim($m[1]));
                } elseif (preg_match('/^DTEND(?:;[^:]+)?:([0-9TZ]+)$/i', $line, $m)) {
                    // DTEND in full-day ical events is day after, so we adjust back by 1 day if needed
                    $rawEndDate = $this->formatIcsDate(trim($m[1]));
                    if ($rawEndDate) {
                        $currentEvent['end_date'] = date('Y-m-d', strtotime($rawEndDate . ' -1 day'));
                    }
                } elseif (preg_match('/^SUMMARY:(.+)$/i', $line, $m)) {
                    $currentEvent['summary'] = stripslashes(trim($m[1]));
                } elseif (preg_match('/^DESCRIPTION:(.+)$/i', $line, $m)) {
                    $currentEvent['description'] = str_replace('\n', "\n", stripslashes(trim($m[1])));
                } elseif (preg_match('/^STATUS:(.+)$/i', $line, $m)) {
                    $currentEvent['status'] = strtoupper(trim($m[1]));
                }
            }
        }

        return $events;
    }

    private function formatIcsDate($dateString)
    {
        // Format YYYYMMDD or YYYYMMDDTHHISZ
        if (preg_match('/^(\d{4})(\d{2})(\d{2})/', $dateString, $matches)) {
            return "{$matches[1]}-{$matches[2]}-{$matches[3]}";
        }
        $ts = strtotime($dateString);
        return $ts ? date('Y-m-d', $ts) : null;
    }

    private function extractGuestName($summary, $platform)
    {
        // Airbnb summary is often "Reserved", "Airbnb (Not available)", or "John Doe"
        // Booking.com summary is often "CLOSED - Not available" or "Booking #123456 - John Doe"
        if (empty($summary) || strtolower($summary) === 'reserved' || stripos($summary, 'not available') !== false) {
            return ucfirst($platform) . " Guest";
        }
        return substr(trim($summary), 0, 100);
    }
}
