<?php
require_once __DIR__ . '/../models/Booking.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../models/TourPackage.php';
require_once __DIR__ . '/../models/Invoice.php';
require_once __DIR__ . '/../models/Referral.php';
require_once __DIR__ . '/../lib/Mailer.php';
require_once __DIR__ . '/../lib/AuthMiddleware.php';

class BookingController
{
    private $pdo;
    private $model;
    private $userModel;
    private $tourModel;
    private $invoiceModel;
    private $referralModel;
    private $mailer;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
        $this->userModel = new User($pdo);
        $this->model = new Booking($pdo, $this->userModel);
        $this->tourModel = new TourPackage($pdo);
        $this->invoiceModel = new Invoice($pdo);
        $this->referralModel = new Referral($pdo);
        $this->mailer = new Mailer($pdo);
    }

    public function getAll()
    {
        echo json_encode($this->model->getAll());
    }

    public function getMyBookings($user)
    {
        $email = $user['email'] ?? '';
        $userId = $user['id'] ?? null;
        echo json_encode($this->model->getByUser($email, $userId));
    }


    private function isBookingAuthorized(array $booking, ?array $currentUser, ?string $token = null): bool
    {
        if (AuthMiddleware::isAdmin($currentUser)) {
            return true;
        }
        if ($currentUser) {
            $userId = $currentUser['id'] ?? null;
            $userEmail = strtolower(trim((string)($currentUser['email'] ?? '')));
            if ($userId && !empty($booking['user_id']) && (int)$booking['user_id'] === (int)$userId) {
                return true;
            }
            if ($userEmail !== '' && strtolower(trim((string)($booking['email'] ?? ''))) === $userEmail) {
                return true;
            }
        }
        return AuthMiddleware::verifyResourceToken('booking', (string)$booking['id'], $token);
    }

    private function validateIsoDate(?string $dateStr): bool
    {
        if (empty($dateStr) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $dateStr)) {
            return false;
        }
        $dt = DateTime::createFromFormat('Y-m-d', $dateStr);
        return $dt && $dt->format('Y-m-d') === $dateStr;
    }

    public function getById($id)
    {
        $booking = $this->model->getById($id);
        if (!$booking) {
            http_response_code(404);
            echo json_encode(['error' => 'Booking not found']);
            return;
        }

        $currentUser = AuthMiddleware::authenticate();
        $token = $_GET['token'] ?? null;
        if (!$this->isBookingAuthorized($booking, $currentUser, $token)) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized: Valid authentication or booking access token required']);
            return;
        }

        if (!AuthMiddleware::isAdmin($currentUser)) {
            unset($booking['admin_notes']);
        }

        echo json_encode($booking);
    }

    private function calculateAuthoritativeGrossAmount(array $data, ?array $tourPackage, int $guests): float
    {
        if ($tourPackage) {
            $tiers = $tourPackage['pricing_tiers'] ?? [];
            if (is_string($tiers)) {
                $tiers = json_decode($tiers, true) ?: [];
            }
            if (is_array($tiers) && count($tiers) > 0) {
                usort($tiers, fn($a, $b) => ((int)($a['min_guests'] ?? 0)) <=> ((int)($b['min_guests'] ?? 0)));
                $matched = null;
                foreach ($tiers as $tier) {
                    $min = (int)($tier['min_guests'] ?? 0);
                    $max = isset($tier['max_guests']) && $tier['max_guests'] !== null ? (int)$tier['max_guests'] : null;
                    if ($guests >= $min && ($max === null || $guests <= $max)) {
                        $matched = $tier;
                        break;
                    }
                }
                if ($matched) {
                    $tierPrice = floatval($matched['price'] ?? 0);
                    return ($matched['pricing_type'] ?? 'per_person') === 'fixed_group'
                        ? round($tierPrice, 2)
                        : round($tierPrice * $guests, 2);
                }
            }

            $rawPrice = preg_replace('/[^0-9.]/', '', (string)($tourPackage['price'] ?? ''));
            $basePrice = floatval($rawPrice);
            if ($basePrice > 0) {
                return round($basePrice * $guests, 2);
            }
        }

        return max(0.0, round(floatval($data['total_price'] ?? 0), 2));
    }

    public function create()
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid JSON']);
            return;
        }

        try {
            $tourPackage = null;
            $tourPackageId = $data['tour_package_id'] ?? ($data['tour_type_id'] ?? null);
            if (!empty($tourPackageId)) {
                try {
                    $tourPackage = $this->tourModel->getById($tourPackageId);
                } catch (\Exception $e) {
                    error_log("Could not fetch tour package for booking calculation: " . $e->getMessage());
                }
            }

            $adults = isset($data['adults']) ? (int)$data['adults'] : 1;
            $children = isset($data['children']) ? (int)$data['children'] : 0;
            $guests = max(1, isset($data['guests']) ? (int)$data['guests'] : ($adults + $children));
            $grossAmount = $this->calculateAuthoritativeGrossAmount($data, $tourPackage, $guests);

            $appliedAgent = null;
            $referralBreakdown = null;
            $referralCode = trim((string)($data['referral_code'] ?? ''));

            if ($referralCode !== '') {
                $settings = $this->referralModel->getSettings();
                if (empty($settings['program_enabled'])) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Referral program is currently paused.']);
                    return;
                }

                $appliedAgent = $this->referralModel->getApprovedAgentByCode($referralCode);
                if (!$appliedAgent) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Invalid or unapproved referral code.']);
                    return;
                }

                $currentUser = AuthMiddleware::authenticate();
                $callerUserId = $currentUser['id'] ?? ($data['user_id'] ?? null);
                $bookingEmail = trim((string)($data['email'] ?? ''));

                if (
                    ($callerUserId && (int)$callerUserId === (int)$appliedAgent['user_id']) ||
                    ($bookingEmail !== '' && strcasecmp($bookingEmail, (string)$appliedAgent['user_email']) === 0)
                ) {
                    http_response_code(400);
                    echo json_encode(['error' => 'You cannot apply your own referral code to a booking.']);
                    return;
                }

                $referralBreakdown = $this->referralModel->calculateBreakdown($grossAmount, $appliedAgent);
                $data['gross_amount'] = $referralBreakdown['gross_amount'];
                $data['discount_amount'] = $referralBreakdown['guest_discount_amount'];
                $data['total_price'] = $referralBreakdown['net_booking_amount'];
                $data['referral_code_id'] = $appliedAgent['id'];
                $data['referral_code_used'] = $appliedAgent['referral_code'];
            } else {
                $data['gross_amount'] = $grossAmount;
                $data['discount_amount'] = 0.00;
                $data['total_price'] = $grossAmount;
            }

            $newBookingId = $this->model->create($data);

            if ($appliedAgent && $referralBreakdown && !empty($referralBreakdown['eligible'])) {
                try {
                    $this->referralModel->recordCommission($appliedAgent, (int)$newBookingId, $referralBreakdown);
                } catch (\Exception $e) {
                    error_log("Failed to record referral commission for booking #$newBookingId: " . $e->getMessage());
                }
            }

            $newBooking = $this->model->getById($newBookingId);

            // Dispatch customer and admin emails in backend
            try {
                $this->mailer->sendBookingEmails($newBooking, $tourPackage);
            } catch (\Exception $e) {
                error_log("Mailer dispatch failed for booking #$newBookingId: " . $e->getMessage());
            }

            $newBooking['access_token'] = AuthMiddleware::generateResourceToken('booking', (string)$newBooking['id']);

            http_response_code(201);
            echo json_encode($newBooking);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function update($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid JSON']);
            return;
        }

        try {
            $this->model->update($id, $data);
            $updatedBooking = $this->model->getById($id);
            echo json_encode($updatedBooking);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }
    
    public function updateStatus($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);
        if (json_last_error() !== JSON_ERROR_NONE || !isset($data['status'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid request. Status is required.']);
            return;
        }
        
        try {
            $prev = $this->model->getById($id);
            $newStatus = $data['status'];
            $this->model->updateStatus($id, $newStatus);
            $this->referralModel->syncStatusByBookingId((int)$id, (string)$newStatus);
            $updated = $this->model->getById($id);

            // Auto-dispatch luxury confirmation email to traveler
            if (in_array($newStatus, ['accepted', 'confirmed']) && $prev && !in_array($prev['status'], ['accepted', 'confirmed'])) {
                try {
                    $tourPackage = !empty($updated['tour_package_id']) ? $this->tourModel->getById($updated['tour_package_id']) : null;
                    $this->mailer->sendBookingAcceptedEmail($updated, $tourPackage);
                } catch (\Exception $mailErr) {
                    error_log("Failed to send booking accepted confirmation email: " . $mailErr->getMessage());
                }
            }

            echo json_encode(['message' => 'Booking status updated successfully.', 'booking' => $updated]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    public function reschedule($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);
        if (json_last_error() !== JSON_ERROR_NONE || empty($data['new_date'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid request. New tour date is required.']);
            return;
        }

        $newDate = trim((string)$data['new_date']);
        $newEndDate = !empty($data['new_end_date']) ? trim((string)$data['new_end_date']) : null;
        if (!$this->validateIsoDate($newDate) || ($newEndDate !== null && !$this->validateIsoDate($newEndDate))) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid date format. Expected YYYY-MM-DD.']);
            return;
        }
        if ($newEndDate !== null && $newEndDate < $newDate) {
            http_response_code(400);
            echo json_encode(['error' => 'End date cannot be earlier than start date.']);
            return;
        }

        $existing = $this->model->getById($id);
        if (!$existing) {
            http_response_code(404);
            echo json_encode(['error' => 'Booking not found']);
            return;
        }

        return $this->performReschedule($id, $existing, $data, $newDate, $newEndDate);
    }

    public function rescheduleRequest($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);
        if (json_last_error() !== JSON_ERROR_NONE || empty($data['new_date'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid request. New tour date is required.']);
            return;
        }

        $newDate = trim((string)$data['new_date']);
        $newEndDate = !empty($data['new_end_date']) ? trim((string)$data['new_end_date']) : null;
        if (!$this->validateIsoDate($newDate) || ($newEndDate !== null && !$this->validateIsoDate($newEndDate))) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid date format. Expected YYYY-MM-DD.']);
            return;
        }
        if ($newDate < date('Y-m-d')) {
            http_response_code(400);
            echo json_encode(['error' => 'New tour date cannot be in the past.']);
            return;
        }
        if ($newEndDate !== null && $newEndDate < $newDate) {
            http_response_code(400);
            echo json_encode(['error' => 'End date cannot be earlier than start date.']);
            return;
        }

        $existing = $this->model->getById($id);
        if (!$existing) {
            http_response_code(404);
            echo json_encode(['error' => 'Booking not found']);
            return;
        }

        $currentUser = AuthMiddleware::authenticate();
        $token = $data['access_token'] ?? ($_GET['token'] ?? null);
        $authorized = $this->isBookingAuthorized($existing, $currentUser, $token);

        if (!$authorized) {
            $providedEmail = strtolower(trim((string)($data['email'] ?? '')));
            $bookingEmail = strtolower(trim((string)($existing['email'] ?? '')));
            $providedInvoice = trim((string)($data['invoice_number'] ?? ''));

            if ($providedInvoice !== '' && $providedEmail !== '') {
                $linkedInvoice = $this->invoiceModel->getByBookingId($id);
                if (
                    $linkedInvoice &&
                    strcasecmp($providedInvoice, (string)($linkedInvoice['invoice_number'] ?? '')) === 0 &&
                    ($providedEmail === $bookingEmail || strcasecmp($providedEmail, trim((string)($linkedInvoice['customer_email'] ?? ''))) === 0)
                ) {
                    $authorized = true;
                }
            }
        }

        if (!$authorized) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden: Verification required to reschedule this booking.']);
            return;
        }

        return $this->performReschedule($id, $existing, $data, $newDate, $newEndDate);
    }

    private function performReschedule($id, array $existing, array $data, string $newDate, ?string $newEndDate)
    {
        $prevDate = $existing['tour_date'];
        $reason = $data['reason'] ?? null;
        $sendEmail = !isset($data['send_email']) || $data['send_email'] === true;

        try {
            $this->model->reschedule($id, $newDate, $newEndDate, $reason);

            // Auto-update linked invoice tour date if exists
            try {
                $this->invoiceModel->updateDatesByBookingId($id, $newDate);
            } catch (\Exception $e) {
                error_log("Could not update linked invoice date: " . $e->getMessage());
            }

            $updatedBooking = $this->model->getById($id);

            // Fetch tour package and invoice for enriched email
            $tourPackage = null;
            if (!empty($updatedBooking['tour_package_id'])) {
                try {
                    $tourPackage = $this->tourModel->getById($updatedBooking['tour_package_id']);
                } catch (\Exception $e) {}
            }

            $invoice = $this->invoiceModel->getByBookingId($id);

            // Dispatch automated Reschedule email
            if ($sendEmail) {
                try {
                    $this->mailer->sendRescheduleEmail($updatedBooking, $prevDate, $newDate, $newEndDate, $reason, $tourPackage, $invoice);
                } catch (\Exception $e) {
                    error_log("Failed to dispatch reschedule email: " . $e->getMessage());
                }
            }

            echo json_encode([
                'message' => 'Tour date rescheduled successfully.',
                'booking' => $updatedBooking,
                'invoice' => $invoice
            ]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to reschedule tour: ' . $e->getMessage()]);
        }
    }

    public function updateNotes($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);
        if (json_last_error() !== JSON_ERROR_NONE || !isset($data['admin_notes'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid request. admin_notes is required.']);
            return;
        }

        try {
            $this->model->updateNotes($id, $data['admin_notes']);
            echo json_encode(['message' => 'Admin notes updated successfully.', 'admin_notes' => $data['admin_notes']]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    public function delete($id)
    {
        if ($this->model->delete($id)) {
            $this->referralModel->deleteCommissionByBookingId((int)$id);
            echo json_encode(['message' => 'Booking deleted successfully']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Booking not found']);
        }
    }
}
