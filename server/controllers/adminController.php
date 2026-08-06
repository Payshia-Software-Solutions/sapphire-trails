<?php
require_once './models/Admin.php'; // Adjust the path if needed

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
        echo json_encode($admins);
    }

    // GET /admins/{id}/
    public function getAdminById($id)
    {
        $admin = $this->model->getAdminById($id);
        if ($admin) {
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
                echo json_encode(['error' => 'Invalid role']);
                return;
            }

            $existing = $this->model->getAdminByUsername($data['username']);
            if ($existing) {
                http_response_code(409);
                echo json_encode(['error' => 'Username already exists']);
                return;
            }

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
            echo json_encode(['error' => 'Invalid input']);
        }
    }

    // POST /admin/login/
    public function login()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        if ($data && isset($data['username'], $data['password'])) {
            $admin = $this->model->getAdminByUsername($data['username']);

            if ($admin && password_verify($data['password'], $admin['password_hash'])) {
                unset($admin['password_hash']);
                http_response_code(200);
                echo json_encode(['message' => 'Login successful', 'admin' => $admin]);
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

        if ($data && isset($data['username'], $data['password'], $data['role'])) {
            $existing = $this->model->getAdminById($id);
            if (!$existing) {
                http_response_code(404);
                echo json_encode(['error' => 'Admin not found']);
                return;
            }

            $data['password_hash'] = password_hash($data['password'], PASSWORD_DEFAULT);
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
