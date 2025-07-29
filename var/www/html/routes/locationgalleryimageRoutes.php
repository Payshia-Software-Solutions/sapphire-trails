<?php
require_once './controllers/locationgalleryimageController.php';

return function ($router) {
    $controller = new LocationGalleryImageController($GLOBALS['pdo']);

    $router->post('/', [$controller, 'create']);
    $router->post('/{id}', [$controller, 'update']);
    $router->delete('/{id}', [$controller, 'deleteById']);
    $router->delete('/location/{slug}', [$controller, 'deleteByLocationSlug']);
    $router->get('/location/{slug}', [$controller, 'getByLocationSlug']);
    $router->get('/', [$controller, 'getAll']);
};
?>
