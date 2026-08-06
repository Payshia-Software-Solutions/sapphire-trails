<?php
require_once './controllers/userController.php'; // Adjust path if needed

$pdo = $GLOBALS['pdo'];
$userController = new UserController($pdo);

return [
    'GET /users/' => function () use ($userController) {
        $userController->getAll(); // Changed from getAllUsers()
    },
    'GET /users/{id}/' => function ($id) use ($userController) {
        $userController->getById($id); // Changed from getUserById()
    },
    'POST /users/' => function () use ($userController) {
        $userController->create(); // Changed from createUser()
    },
    'POST /login/' => function () use ($userController) {
        $userController->login(); // This one is correct
    },
    'PUT /users/{id}/' => function ($id) use ($userController) {
        // You don't have an update method in your controller yet
        // You'll need to add this method to UserController
        $userController->update($id);
    },
    'DELETE /users/{id}/' => function ($id) use ($userController) {
        $userController->delete($id); // Changed from deleteUser()
    },
     'PUT /users/{id}/' => function ($id) use ($userController) {
        $userController->update($id);
    },
];