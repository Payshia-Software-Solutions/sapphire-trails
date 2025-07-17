<?php
require_once './controllers/UserController.php';

$pdo = $GLOBALS['pdo'];
$userController = new UserController($pdo);

return [
    'GET /users/' => function () use ($userController) {
        $userController->getAll();
    },
    'GET /users/type/{type}/' => function ($type) use ($userController) {
        $userController->getByType($type);
    },
    'GET /users/{id}/' => function ($id) use ($userController) {
        $userController->getById($id);
    },
    'POST /users/' => function () use ($userController) {
        $userController->create();
    },
    'DELETE /users/{id}/' => function ($id) use ($userController) {
        $userController->delete($id);
    }
];
?>