<?php
require_once __DIR__ . '/../models/Admin.php';
require_once __DIR__ . '/../lib/JWT.php';
require_once __DIR__ . '/../lib/Env.php';

class AdminController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new Admin($pdo);
    }

    // GET /admins/
    public function getAllAdmins()
    {
        $admins = $this->model->getAllAdmins();
        // Remove password hashes from all admin records
        foreach ($admins as &$admin) {
            unset($admin['password_hash']);
        }
        echo json_encode($admins);
    }

    // GET /admins/{id}/
    public function getAdminById($id)
    {
        $admin = $this->model->getAdminById($id);
        if ($admin) {
            unset($admin['password_hash']);
            echo json_encode($admin);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Admin not found']);
        }
    }

    // POST /admins/
    public function createAdmin()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        if ($data && isset($data['username'], $data['password'], $data['role'])) {
            if (!in_array($data['role'], ['admin', 'superadmin'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid role. Must be admin or superadmin']);
                return;
            }

            $username = trim($data['username']);
            if (strlen($username) < 3 || strlen($data['password']) < 6) {
                http_response_code(400);
                echo json_encode(['error' => 'Username must be at least 3 characters and password at least 6 characters']);
                return;
            }

            $existing = $this->model->getAdminByUsername($username);
            if ($existing) {
                http_response_code(409);
                echo json_encode(['error' => 'Username already exists']);
                return;
            }

            $data['username'] = $username;
            $data['password_hash'] = password_hash($data['password'], PASSWORD_DEFAULT);
            $insertedId = $this->model->createAdmin($data);

            $admin = $this->model->getAdminById($insertedId);
            unset($admin['password_hash']);

            http_response_code(201);
            echo json_encode([
                'message' => 'Admin created successfully',
                'admin' => $admin
            ]);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input. username, password, and role are required']);
        }
    }

    // POST /admin/login/
    public function login()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        if ($data && isset($data['username'], $data['password'])) {
            $admin = $this->model->getAdminByUsername(trim($data['username']));

            if ($admin && password_verify($data['password'], $admin['password_hash'])) {
                unset($admin['password_hash']);

                $secret = Env::get('APP_SECRET', 'sapphire_trails_default_fallback_secret_key');
                $jwtExpiresIn = (int) Env::get('JWT_EXPIRES_IN', 86400);

                $tokenPayload = [
                    'id' => $admin['id'],
                    'username' => $admin['username'],
                    'role' => $admin['role'] ?? 'admin',
                    'type' => 'admin'
                ];

                $token = JWT::encode($tokenPayload, $secret, $jwtExpiresIn);

                http_response_code(200);
                echo json_encode([
                    'message' => 'Login successful',
                    'token' => $token,
                    'admin' => $admin
                ]);
            } else {
                http_response_code(401);
                echo json_encode(['message' => 'Invalid username or password']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['message' => 'Username and password are required.']);
        }
    }

    // PUT /admins/{id}/
    public function updateAdmin($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);

        if ($data && isset($data['username'], $data['role'])) {
            $existing = $this->model->getAdminById($id);
            if (!$existing) {
                http_response_code(404);
                echo json_encode(['error' => 'Admin not found']);
                return;
            }

            if (!empty($data['password'])) {
                $data['password_hash'] = password_hash($data['password'], PASSWORD_DEFAULT);
            } else {
                $data['password_hash'] = $existing['password_hash'];
            }

            $this->model->updateAdmin($id, $data);

            $admin = $this->model->getAdminById($id);
            unset($admin['password_hash']);

            echo json_encode([
                'message' => 'Admin updated successfully',
                'admin' => $admin
            ]);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input']);
        }
    }

    // DELETE /admins/{id}/
    public function deleteAdmin($id)
    {
        $existing = $this->model->getAdminById($id);
        if (!$existing) {
            http_response_code(404);
            echo json_encode(['error' => 'Admin not found']);
            return;
        }

        $this->model->deleteAdmin($id);
        echo json_encode(['message' => 'Admin deleted successfully']);
    }
}
