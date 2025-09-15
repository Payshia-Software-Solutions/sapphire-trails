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
        $contact = $this->model->getById($id);
        if ($contact) {
            echo json_encode($contact);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Contact submission not found']);
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
            $newId = $this->model->create($data);
            $newContact = $this->model->getById($newId);
            http_response_code(201);
            echo json_encode($newContact);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function delete($id)
    {
        if ($this->model->delete($id)) {
            http_response_code(204); // No Content
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Contact submission not found']);
        }
    }
}
?>
