<?php
require_once __DIR__ . '/../controllers/userController.php';
require_once __DIR__ . '/../lib/AuthMiddleware.php';

$pdo = $GLOBALS['pdo'];
$userController = new UserController($pdo);

return [
    // Get all users (Admin only)
    'GET /users/' => function () use ($userController) {
        AuthMiddleware::requireAdmin();
        $userController->getAll();
    },

    // Get user by ID (Authenticated user or Admin)
    'GET /users/{id}/' => function ($id) use ($userController) {
        $currentUser = AuthMiddleware::requireAuth();
        // Allow if user is accessing their own profile OR user is admin
        $role = $currentUser['role'] ?? ($currentUser['type'] ?? '');
        if ($currentUser['id'] != $id && !in_array($role, ['admin', 'superadmin'])) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden: You can only access your own profile']);
            exit;
        }
        $userController->getById($id);
    },

    // Public registration
    'POST /users/' => function () use ($userController) {
        $userController->create();
    },

    // Public login
    'POST /login/' => function () use ($userController) {
        $userController->login();
    },

    // Update user profile
    'PUT /users/{id}/' => function ($id) use ($userController) {
        $currentUser = AuthMiddleware::requireAuth();
        $role = $currentUser['role'] ?? ($currentUser['type'] ?? '');
        if ($currentUser['id'] != $id && !in_array($role, ['admin', 'superadmin'])) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden: You can only edit your own profile']);
            exit;
        }
        $userController->update($id);
    },

    // Delete user (Admin only)
    'DELETE /users/{id}/' => function ($id) use ($userController) {
        AuthMiddleware::requireAdmin();
        $userController->delete($id);
    },
];