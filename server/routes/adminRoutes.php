<?php
require_once './controllers/adminController.php';

$pdo = $GLOBALS['pdo'];
$adminController = new AdminController($pdo);

return [
    'GET /admins/' => function () use ($adminController) {
        $adminController->getAllAdmins();
    },
    'GET /admins/{id}/' => function ($id) use ($adminController) {
        $adminController->getAdminById($id);
    },
    'POST /admins/' => function () use ($adminController) {
        $adminController->createAdmin();
    },
    'POST /admin/login/' => function () use ($adminController) {
        $adminController->login();
    },
    'PUT /admins/{id}/' => function ($id) use ($adminController) {
        $adminController->updateAdmin($id);
    },
    'DELETE /admins/{id}/' => function ($id) use ($adminController) {
        $adminController->deleteAdmin($id);
    }
];
