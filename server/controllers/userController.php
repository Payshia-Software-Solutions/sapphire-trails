<?php
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../lib/JWT.php';
require_once __DIR__ . '/../lib/Env.php';
require_once __DIR__ . '/../lib/AuthMiddleware.php';
require_once __DIR__ . '/../lib/GoogleTokenVerifier.php';

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

        if (!$data || empty(trim((string)($data['email'] ?? ''))) || empty($data['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Email and password are required']);
            return;
        }

        $email = trim($data['email']);
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['error' => 'Please provide a valid email address']);
            return;
        }

        if (strlen((string)$data['password']) < 6) {
            http_response_code(400);
            echo json_encode(['error' => 'Password must be at least 6 characters']);
            return;
        }

        $name = trim((string)($data['name'] ?? ''));
        if (empty($name)) {
            http_response_code(400);
            echo json_encode(['error' => 'Name is required']);
            return;
        }

        if ($this->model->getByEmail($email)) {
            http_response_code(409); // 409 Conflict
            echo json_encode(['error' => 'User with this email already exists']);
            return;
        }

        // Only authenticated admins can assign non-client roles
        $currentUser = AuthMiddleware::authenticate();
        $requestedType = $data['type'] ?? 'client';
        if (AuthMiddleware::isAdmin($currentUser) && in_array($requestedType, ['client', 'admin'], true)) {
            $data['type'] = $requestedType;
        } else {
            $data['type'] = 'client';
        }
        $data['name'] = $name;
        $data['email'] = $email;

        try {
            $newUserId = $this->model->create($data);
            $newUser = $this->model->getById($newUserId);
            unset($newUser['password_hash']);

            $secret = AuthMiddleware::getJwtSecret();
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

            $secret = AuthMiddleware::getJwtSecret();
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

    public function googleLogin()
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $accessToken = trim((string)($data['access_token'] ?? ''));
        $idToken = trim((string)($data['id_token'] ?? ''));

        if ($accessToken === '' && $idToken === '') {
            http_response_code(400);
            echo json_encode(['message' => 'Google token is required']);
            return;
        }

        try {
            $googleUser = GoogleTokenVerifier::verify($accessToken ?: null, $idToken ?: null);
        } catch (Exception $e) {
            http_response_code(401);
            echo json_encode(['message' => $e->getMessage()]);
            return;
        }

        $email = $googleUser['email'];
        $name = $googleUser['name'];
        $user = $this->model->getByEmail($email);

        try {
            if (!$user) {
                $newUserId = $this->model->create([
                    'name' => $name,
                    'email' => $email,
                    'phone' => null,
                    'password' => bin2hex(random_bytes(24)),
                    'type' => 'client',
                ]);
                $user = $this->model->getById($newUserId);
            } else {
                unset($user['password_hash']);
            }

            $secret = AuthMiddleware::getJwtSecret();
            $jwtExpiresIn = (int) Env::get('JWT_EXPIRES_IN', 86400);

            $token = JWT::encode([
                'id' => $user['id'],
                'email' => $user['email'],
                'role' => $user['type'] ?? 'client',
                'type' => $user['type'] ?? 'client',
            ], $secret, $jwtExpiresIn);

            echo json_encode([
                'message' => 'Google sign-in successful',
                'token' => $token,
                'user' => $user,
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['message' => 'Database error during Google sign-in']);
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

    public function update($id, $currentUser = null)
    {
        $data = json_decode(file_get_contents('php://input'), true);
        if (!is_array($data)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid JSON input']);
            return;
        }
        
        $existingUser = $this->model->getById($id);
        if (!$existingUser) {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
            return;
        }
        
        if (isset($data['email'])) {
            $newEmail = trim($data['email']);
            if (!filter_var($newEmail, FILTER_VALIDATE_EMAIL)) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid email address']);
                return;
            }
            if (strcasecmp($newEmail, $existingUser['email']) !== 0) {
                $emailExists = $this->model->getByEmail($newEmail);
                if ($emailExists) {
                    http_response_code(409);
                    echo json_encode(['error' => 'User with this email already exists']);
                    return;
                }
            }
            $data['email'] = $newEmail;
        }

        // Prevent non-admin users from escalating their own role/type
        if (!AuthMiddleware::isAdmin($currentUser)) {
            $data['type'] = $existingUser['type'] ?? 'client';
        } elseif (isset($data['type']) && !in_array($data['type'], ['client', 'admin'], true)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid user type']);
            return;
        }

        if (!empty($data['password']) && strlen((string)$data['password']) < 6) {
            http_response_code(400);
            echo json_encode(['error' => 'Password must be at least 6 characters']);
            return;
        }

        // Preserve existing required fields for partial updates
        $data['name'] = isset($data['name']) ? trim((string)$data['name']) : $existingUser['name'];
        $data['email'] = $data['email'] ?? $existingUser['email'];
        $data['phone'] = array_key_exists('phone', $data) ? $data['phone'] : $existingUser['phone'];
        $data['type'] = $data['type'] ?? ($existingUser['type'] ?? 'client');
        
        try {
            $updated = $this->model->update($id, $data);
            
            if ($updated || !empty($data)) {
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
