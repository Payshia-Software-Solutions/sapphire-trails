<?php
require_once __DIR__ . '/../models/Contact.php';
require_once __DIR__ . '/../lib/Mailer.php';

class ContactController
{
    private $pdo;
    private $model;
    private $mailer;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
        $this->model = new Contact($pdo);
        $this->mailer = new Mailer($pdo);
    }

    public function getAll()
    {
        echo json_encode($this->model->getAll());
    }

    public function getById($id)
    {
        $row = $this->model->getById($id);
        if ($row) {
            echo json_encode($row);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Contact message not found']);
        }
    }

    /** Optional helper: /contacts/by-email/?email=... */
    public function getByEmail()
    {
        $email = $_GET['email'] ?? null;
        if (!$email) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing email query parameter']);
            return;
        }
        echo json_encode($this->model->getByEmail($email));
    }

    public function create()
    {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];

        // Basic validation
        $name    = trim($data['name']   ?? '');
        $email   = trim($data['email']  ?? '');
        $message = trim($data['message'] ?? '');
        $phone   = trim($data['phone']   ?? '');
        $subject = trim($data['subject'] ?? 'Website Inquiry');

        if ($name === '' || $email === '' || $message === '') {
            http_response_code(422);
            echo json_encode(['error' => 'name, email and message are required']);
            return;
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(422);
            echo json_encode(['error' => 'Invalid email address']);
            return;
        }

        try {
            $newId = $this->model->create([
                'name' => $name,
                'email' => $email,
                'message' => $message
            ]);

            $created = $this->model->getById($newId);
            $created['phone'] = $phone;
            $created['subject'] = $subject;

            // Dispatch customer and admin contact emails in backend
            try {
                $this->mailer->sendContactEmails($created);
            } catch (\Exception $e) {
                error_log("Mailer contact dispatch error: " . $e->getMessage());
            }

            http_response_code(201);
            echo json_encode($created);

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    public function update($id)
    {
        $existing = $this->model->getById($id);
        if (!$existing) {
            http_response_code(404);
            echo json_encode(['error' => 'Contact message not found']);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true) ?? [];

        // If email provided, validate
        if (isset($data['email']) && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            http_response_code(422);
            echo json_encode(['error' => 'Invalid email address']);
            return;
        }

        try {
            $updated = $this->model->update($id, $data);
            if ($updated) {
                echo json_encode($this->model->getById($id));
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'No changes made or invalid payload']);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    public function updateStatus($id)
    {
        $existing = $this->model->getById($id);
        if (!$existing) {
            http_response_code(404);
            echo json_encode(['error' => 'Contact message not found']);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $status = $data['status'] ?? 'read';

        try {
            $this->model->updateStatus($id, $status);
            echo json_encode($this->model->getById($id));
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    public function reply($id)
    {
        $existing = $this->model->getById($id);
        if (!$existing) {
            http_response_code(404);
            echo json_encode(['error' => 'Contact inquiry not found']);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $to = trim($data['to'] ?? $existing['email']);
        $subject = trim($data['subject'] ?? ('Re: ' . ($existing['subject'] ?: 'Your Inquiry with Sapphire Trails')));
        $message = trim($data['message'] ?? '');

        if (empty($message)) {
            http_response_code(422);
            echo json_encode(['error' => 'Reply message cannot be empty']);
            return;
        }

        if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
            http_response_code(422);
            echo json_encode(['error' => 'Invalid recipient email address']);
            return;
        }

        try {
            $result = $this->mailer->sendInquiryReplyEmail($existing, $message, $subject);

            if ($result['success']) {
                // Auto mark status as replied
                $this->model->updateStatus($id, 'replied');

                http_response_code(200);
                echo json_encode([
                    'message'    => "Reply dispatched successfully to $to",
                    'status'     => 'replied',
                    'submission' => $this->model->getById($id)
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to send email: ' . ($result['error'] ?? 'SMTP delivery failure')]);
            }
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Reply error: ' . $e->getMessage()]);
        }
    }

    public function delete($id)
    {
        $deleted = $this->model->delete($id);
        if ($deleted) {
            http_response_code(204); // No Content
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Contact message not found']);
        }
    }
}


