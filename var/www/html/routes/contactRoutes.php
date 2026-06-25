<?php
require_once './controllers/ContactController.php';

return function ($router) {
    $controller = new ContactController($GLOBALS['pdo']);

    $router->get('/', [$controller, 'getAll']);
    $router->get('/{id}', [$controller, 'getById']);
    $router->post('/', [$controller, 'create']);
    $router->delete('/{id}', [$controller, 'delete']);
};
?>
