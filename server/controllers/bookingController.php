<?php
require_once __DIR__ . '/../models/Booking.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../models/TourPackage.php';
require_once __DIR__ . '/../models/Invoice.php';
require_once __DIR__ . '/../lib/Mailer.php';

class BookingController
{
    private $pdo;
    private $model;
    private $userModel;
    private $tourModel;
    private $invoiceModel;
    private $mailer;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
        $this->userModel = new User($pdo);
        $this->model = new Booking($pdo, $this->userModel);
        $this->tourModel = new TourPackage($pdo);
        $this->invoiceModel = new Invoice($pdo);
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


    public function getById($id)
    {
        $booking = $this->model->getById($id);
        if ($booking) {
            echo json_encode($booking);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Booking not found']);
        }
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
            $newBookingId = $this->model->create($data);
            $newBooking = $this->model->getById($newBookingId);

            // Fetch tour package info for enriched emails
            $tourPackage = null;
            $tourPackageId = $newBooking['tour_package_id'] ?? ($data['tour_package_id'] ?? null);
            if (!empty($tourPackageId)) {
                try {
                    $tourPackage = $this->tourModel->getById($tourPackageId);
                } catch (\Exception $e) {
                    error_log("Could not fetch tour package for email: " . $e->getMessage());
                }
            }

            // Dispatch customer and admin emails in backend
            try {
                $this->mailer->sendBookingEmails($newBooking, $tourPackage);
            } catch (\Exception $e) {
                error_log("Mailer dispatch failed for booking #$newBookingId: " . $e->getMessage());
            }

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

        $existing = $this->model->getById($id);
        if (!$existing) {
            http_response_code(404);
            echo json_encode(['error' => 'Booking not found']);
            return;
        }

        $prevDate = $existing['tour_date'];
        $newDate = $data['new_date'];
        $newEndDate = $data['new_end_date'] ?? null;
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
            echo json_encode(['message' => 'Booking deleted successfully']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Booking not found']);
        }
    }
}
