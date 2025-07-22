<?php
require_once './models/User.php';

class UserController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new User($pdo);
    }

    public function getAll()
    {
        echo json_encode($this->model->getAll());
    }
    
    public function getByType($type) {
        $users = $this->model->getByType($type);
        echo json_encode($users);
    }

    public function getById($id)
    {
        $user = $this->model->getById($id);
        if ($user) {
            echo json_encode($user);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
        }
    }

    public function create()
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if ($this->model->getByEmail($data['email'])) {
            http_response_code(409); // 409 Conflict
            echo json_encode(['error' => 'User with this email already exists']);
            return;
        }

        try {
            $newUserId = $this->model->create($data);
            $newUser = $this->model->getById($newUserId);
            http_response_code(201);
            echo json_encode($newUser); // Return the new user object directly
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    public function login()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $user = $this->model->getByEmail($data['email']);

        if ($user && password_verify($data['password'], $user['password_hash'])) {
            // Unset password hash before sending user data
            unset($user['password_hash']);
            
            // Consistently return the user data inside a "user" object
            echo json_encode(['user' => $user]);

        } else {
            http_response_code(401);
            echo json_encode(['message' => 'Invalid credentials']);
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
            $updatedUser = $this->model->getById($id);
            echo json_encode($updatedUser);
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
            echo json_encode(['error' => 'User not found']);
        }
    }
}
