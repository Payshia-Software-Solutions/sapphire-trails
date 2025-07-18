<?php
require_once './controllers/UserController.php';

return function ($router) {
    $controller = new UserController($GLOBALS['pdo']);

    // Route to get all users
    $router->get('/', [$controller, 'getAll']);

    // Route to create a new user (for signup)
    $router->post('/', [$controller, 'create']);
    
    // Route for login
    $router->post('/login', [$controller, 'login']);

    // Route to get users by type (e.g., 'admin' or 'client')
    $router->get('/type/{type}', [$controller, 'getByType']);

    // Route to get a specific user by ID
    $router->get('/{id}', [$controller, 'getById']);

    // Route to delete a user
    $router->delete('/{id}', [$controller, 'delete']);
};
?>
