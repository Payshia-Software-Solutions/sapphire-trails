<?php
require_once __DIR__ . '/../models/Invoice.php';
require_once __DIR__ . '/../models/Booking.php';
require_once __DIR__ . '/../lib/Mailer.php';

class InvoiceController
{
    private $pdo;
    private $model;
    private $bookingModel;
    private $mailer;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
        $this->model = new Invoice($pdo);
        $this->bookingModel = new Booking($pdo);
        $this->mailer = new Mailer($pdo);
    }

    public function getAll()
    {
        $filters = [
            'status' => $_GET['status'] ?? 'all',
            'search' => $_GET['search'] ?? null,
        ];
        echo json_encode($this->model->getAll($filters));
    }

    public function getById($id)
    {
        $invoice = $this->model->getById($id);
        if ($invoice) {
            echo json_encode($invoice);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Invoice not found']);
        }
    }

    public function getByNumber($invoiceNumber)
    {
        $invoice = $this->model->getByNumber($invoiceNumber);
        if ($invoice) {
            echo json_encode($invoice);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Invoice not found']);
        }
    }

    public function getByBookingId($bookingId)
    {
        $invoice = $this->model->getByBookingId($bookingId);
        if ($invoice) {
            echo json_encode($invoice);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'No invoice linked to this booking']);
        }
    }

    public function create()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        if (json_last_error() !== JSON_ERROR_NONE || empty($data['customer_name']) || empty($data['customer_email'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid data. Customer name and email are required.']);
            return;
        }

        try {
            $newInvoiceId = $this->model->create($data);
            $newInvoice = $this->model->getById($newInvoiceId);

            // Optional: send email immediately if requested
            if (!empty($data['send_email'])) {
                try {
                    $this->mailer->sendInvoiceEmail($newInvoice);
                } catch (\Exception $e) {
                    error_log("Failed to auto-send invoice email: " . $e->getMessage());
                }
            }

            http_response_code(201);
            echo json_encode($newInvoice);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create invoice: ' . $e->getMessage()]);
        }
    }

    public function update($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);
        if (json_last_error() !== JSON_ERROR_NONE || empty($data['customer_name']) || empty($data['customer_email'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid data. Customer name and email are required.']);
            return;
        }

        try {
            $this->model->update($id, $data);
            $updated = $this->model->getById($id);
            echo json_encode($updated);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update invoice: ' . $e->getMessage()]);
        }
    }

    public function updatePayment($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);
        if (json_last_error() !== JSON_ERROR_NONE || !isset($data['payment_status'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Payment status is required.']);
            return;
        }

        try {
            $status = $data['payment_status'];
            $amountPaid = isset($data['amount_paid']) ? floatval($data['amount_paid']) : null;
            $paymentMethod = $data['payment_method'] ?? null;

            $this->model->updatePaymentStatus($id, $status, $amountPaid, $paymentMethod);
            $updated = $this->model->getById($id);
            echo json_encode($updated);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update payment: ' . $e->getMessage()]);
        }
    }

    public function sendEmail($id)
    {
        $invoice = $this->model->getById($id);
        if (!$invoice) {
            http_response_code(404);
            echo json_encode(['error' => 'Invoice not found']);
            return;
        }

        try {
            $result = $this->mailer->sendInvoiceEmail($invoice);
            if ($result['success']) {
                echo json_encode(['message' => 'Invoice email dispatched successfully.']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => $result['error'] ?? 'Could not send invoice email.']);
            }
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to dispatch email: ' . $e->getMessage()]);
        }
    }

    public function getSettings()
    {
        echo json_encode($this->model->getSettings());
    }

    public function updateSettings()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid JSON']);
            return;
        }

        try {
            $this->model->saveSettings($data);
            echo json_encode(['message' => 'Billing settings saved successfully.', 'settings' => $this->model->getSettings()]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to save billing settings: ' . $e->getMessage()]);
        }
    }

    public function delete($id)
    {
        if ($this->model->delete($id)) {
            echo json_encode(['message' => 'Invoice deleted successfully']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Invoice not found']);
        }
    }
}
