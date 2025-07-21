<?php
require_once './controllers/TourPackageController.php';

return function ($router) {
    $controller = new TourPackageController($GLOBALS['pdo']);

    $router->get('/', [$controller, 'getAll']);
    
    // This route must come before the one with the numeric ID
    $router->get('/slug/{slug}', [$controller, 'getBySlug']);

    $router->get('/{id}', [$controller, 'getById']);
    $router->post('/', [$controller, 'create']);

    // Route for updating a package. Uses POST with a method override.
    $router->post('/{id}', [$controller, 'update']);
    
    $router->delete('/{id}', [$controller, 'delete']);
};
?>
