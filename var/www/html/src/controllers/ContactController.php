<?php
require_once './models/Contact.php';

class ContactController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new Contact($pdo);
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
        $tour_interest = trim($data['tour_interest'] ?? '');

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
                'message' => $message,
                'tour_interest' => $tour_interest
            ]);

            $created = $this->model->getById($newId);
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
