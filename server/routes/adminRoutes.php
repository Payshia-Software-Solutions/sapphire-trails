<?php
require_once __DIR__ . '/../controllers/adminController.php';
require_once __DIR__ . '/../lib/AuthMiddleware.php';

$pdo = $GLOBALS['pdo'];
$adminController = new AdminController($pdo);

return [
    'GET /admins/' => function () use ($adminController) {
        AuthMiddleware::requireAdmin();
        $adminController->getAllAdmins();
    },
    'GET /admins/{id}/' => function ($id) use ($adminController) {
        AuthMiddleware::requireAdmin();
        $adminController->getAdminById($id);
    },
    'POST /admins/' => function () use ($adminController) {
        AuthMiddleware::requireAdmin();
        $adminController->createAdmin();
    },
    'POST /admin/login/' => function () use ($adminController) {
        $adminController->login();
    },
    'PUT /admins/{id}/' => function ($id) use ($adminController) {
        AuthMiddleware::requireAdmin();
        $adminController->updateAdmin($id);
    },
    'DELETE /admins/{id}/' => function ($id) use ($adminController) {
        AuthMiddleware::requireAdmin();
        $adminController->deleteAdmin($id);
    }
];
