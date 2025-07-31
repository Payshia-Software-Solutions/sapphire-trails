<?php
require_once './controllers/locationController.php';

return function ($router) {
    $controller = new LocationController($GLOBALS['pdo']);

    $router->get('/', [$controller, 'getAll']);
    $router->get('/{slug}', [$controller, 'getBySlug']);
    $router->post('/', [$controller, 'create']);
    $router->post('/{slug}', [$controller, 'update']);
    $router->delete('/{slug}', [$controller, 'delete']);
};
?>
