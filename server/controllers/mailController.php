<?php

require_once __DIR__ . '/../models/Mail.php';
require_once __DIR__ . '/../lib/Mailer.php';

class MailController
{
    private $pdo;
    private $mailModel;
    private $mailer;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
        $this->mailModel = new Mail($pdo);
        $this->mailer = new Mailer($pdo);
    }

    public function getSettings()
    {
        try {
            $settings = $this->mailModel->getSettings();
            // Mask password for security
            if (!empty($settings['smtp_password'])) {
                $settings['smtp_password'] = '********';
            }
            header('Content-Type: application/json');
            echo json_encode($settings);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to retrieve mail settings: ' . $e->getMessage()]);
        }
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
            $updated = $this->mailModel->updateSettings($data);
            if (!empty($updated['smtp_password'])) {
                $updated['smtp_password'] = '********';
            }
            header('Content-Type: application/json');
            echo json_encode([
                'message'  => 'Mail settings updated successfully',
                'settings' => $updated
            ]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update mail settings: ' . $e->getMessage()]);
        }
    }

    public function sendTest()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $to = trim($data['to'] ?? '');

        if (empty($to) || !filter_var($to, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['error' => 'Valid recipient email address is required']);
            return;
        }

        try {
            $result = $this->mailer->sendTestEmail($to);
            header('Content-Type: application/json');
            if ($result['success']) {
                echo json_encode(['message' => "Test email dispatched successfully to $to"]);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'SMTP Delivery Failed: ' . ($result['error'] ?? 'Unknown error')]);
            }
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Test email failed: ' . $e->getMessage()]);
        }
    }

    public function getLogs()
    {
        $limit     = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
        $offset    = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
        $status    = $_GET['status'] ?? null;
        $emailType = $_GET['email_type'] ?? null;
        $search    = $_GET['search'] ?? null;

        try {
            $data = $this->mailModel->getLogs($limit, $offset, $status, $emailType, $search);
            header('Content-Type: application/json');
            echo json_encode($data);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to retrieve logs: ' . $e->getMessage()]);
        }
    }

    public function clearLogs()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $days = isset($data['older_than_days']) ? (int)$data['older_than_days'] : null;

        try {
            $this->mailModel->clearLogs($days);
            header('Content-Type: application/json');
            echo json_encode(['message' => 'Mail logs cleared successfully']);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to clear logs: ' . $e->getMessage()]);
        }
    }
}
