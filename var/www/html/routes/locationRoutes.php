<?php
require_once './controllers/locationController.php';

$pdo = $GLOBALS['pdo'];
$locationController = new LocationController($pdo);

return [
    'GET /locations/' => function () use ($locationController) {
        $locationController->getAll();
    },
    'GET /locations/{slug}/' => function ($slug) use ($locationController) {
        $locationController->getBySlug($slug);
    },
    'POST /locations/' => function () use ($locationController) {
        $locationController->create();
        
    },
    'DELETE /locations/{slug}/' => function ($slug) use ($locationController) {
        $locationController->delete($slug);
    },
    'POST /locations/{slug}/' => function ($slug) use ($locationController) {
        $locationController->update($slug);
    },
];
