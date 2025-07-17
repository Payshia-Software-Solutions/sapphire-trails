<?php
require_once './controllers/TourPackageController.php';

return function ($router) {
    $controller = new TourPackageController($GLOBALS['pdo']);

    $router->get('/', [$controller, 'getAll']);
    $router->post('/', [$controller, 'create']);

    // This route must come before the one with the numeric ID
    $router->get('/slug/{slug}', [$controller, 'getBySlug']);

    $router->get('/{id}', [$controller, 'getById']);
    $router->delete('/{id}', [$controller, 'delete']);
};
?>
