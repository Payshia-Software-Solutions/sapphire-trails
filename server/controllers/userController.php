<?php
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../lib/JWT.php';
require_once __DIR__ . '/../lib/Env.php';

class UserController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new User($pdo);
    }

    public function getAll()
    {
        $users = $this->model->getAll();
        foreach ($users as &$user) {
            unset($user['password_hash']);
        }
        echo json_encode($users);
    }
    
    public function getByType($type) {
        $users = $this->model->getByType($type);
        foreach ($users as &$user) {
            unset($user['password_hash']);
        }
        echo json_encode($users);
    }

    public function getById($id)
    {
        $user = $this->model->getById($id);
        if ($user) {
            unset($user['password_hash']);
            echo json_encode($user);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
        }
    }

    public function create()
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!$data || empty($data['email']) || empty($data['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Email and password are required']);
            return;
        }

        if ($this->model->getByEmail($data['email'])) {
            http_response_code(409); // 409 Conflict
            echo json_encode(['error' => 'User with this email already exists']);
            return;
        }

        try {
            $newUserId = $this->model->create($data);
            $newUser = $this->model->getById($newUserId);
            unset($newUser['password_hash']);

            $secret = Env::get('APP_SECRET', 'sapphire_trails_default_fallback_secret_key');
            $jwtExpiresIn = (int) Env::get('JWT_EXPIRES_IN', 86400);

            $token = JWT::encode([
                'id' => $newUser['id'],
                'email' => $newUser['email'],
                'role' => $newUser['type'] ?? 'client',
                'type' => $newUser['type'] ?? 'client'
            ], $secret, $jwtExpiresIn);

            http_response_code(201);
            echo json_encode([
                'token' => $token,
                'user' => $newUser
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    public function login()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data || empty($data['email']) || empty($data['password'])) {
            http_response_code(400);
            echo json_encode(['message' => 'Email and password are required']);
            return;
        }

        $user = $this->model->getByEmail(trim($data['email']));

        if ($user && password_verify($data['password'], $user['password_hash'])) {
            unset($user['password_hash']);

            $secret = Env::get('APP_SECRET', 'sapphire_trails_default_fallback_secret_key');
            $jwtExpiresIn = (int) Env::get('JWT_EXPIRES_IN', 86400);

            $token = JWT::encode([
                'id' => $user['id'],
                'email' => $user['email'],
                'role' => $user['type'] ?? 'client',
                'type' => $user['type'] ?? 'client'
            ], $secret, $jwtExpiresIn);
            
            echo json_encode([
                'message' => 'Login successful',
                'token' => $token,
                'user' => $user
            ]);
        } else {
            http_response_code(401);
            echo json_encode(['message' => 'Invalid credentials']);
        }
    }

    public function delete($id)
    {
        $deleted = $this->model->delete($id);
        if ($deleted) {
            http_response_code(200);
            echo json_encode(['message' => 'User deleted successfully']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
        }
    }

    public function update($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);
        
        $existingUser = $this->model->getById($id);
        if (!$existingUser) {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
            return;
        }
        
        if (isset($data['email']) && $data['email'] !== $existingUser['email']) {
            $emailExists = $this->model->getByEmail($data['email']);
            if ($emailExists) {
                http_response_code(409);
                echo json_encode(['error' => 'User with this email already exists']);
                return;
            }
        }
        
        try {
            $updated = $this->model->update($id, $data);
            
            if ($updated) {
                $updatedUser = $this->model->getById($id);
                unset($updatedUser['password_hash']);
                http_response_code(200);
                echo json_encode($updatedUser);
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'No changes made or invalid data']);
            }
            
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }
}
