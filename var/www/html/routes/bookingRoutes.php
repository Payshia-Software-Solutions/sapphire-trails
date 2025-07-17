<?php
require_once './controllers/BookingController.php';

return function ($router) {
    $controller = new BookingController($GLOBALS['pdo']);

    $router->get('/', [$controller, 'getAll']);
    $router->get('/{id}', [$controller, 'getById']);
    $router->post('/', [$controller, 'create']);
    $router->put('/{id}', [$controller, 'update']);
    $router->put('/{id}/status', [$controller, 'updateStatus']);
    $router->delete('/{id}', [$controller, 'delete']);
};
?>
