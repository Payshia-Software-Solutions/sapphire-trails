<?php
require_once './controllers/TourPackageController.php';

return function ($router) {
    $controller = new TourPackageController($GLOBALS['pdo']);

    $router->get('/', [$controller, 'getAll']);
    
    // Using POST for updates because of FormData limitations with PUT
    $router->post('/{id}', [$controller, 'update']); 
    
    // This route must come before the one with the numeric ID
    $router->get('/slug/{slug}', [$controller, 'getBySlug']);

    $router->get('/{id}', [$controller, 'getById']);
    $router->post('/', [$controller, 'create']);
    $router->delete('/{id}', [$controller, 'delete']);
};
?>
