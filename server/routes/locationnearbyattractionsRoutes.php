<?php
require_once './controllers/locationnearbyattractionsController.php';

$pdo = $GLOBALS['pdo'];
$nearbyAttractionsController = new LocationNearbyAttractionsController($pdo);

return [
    'GET /location-nearby-attractions/' => function () use ($nearbyAttractionsController) {
        $nearbyAttractionsController->getAll();
    },
    'GET /location-nearby-attractions/location/{slug}/' => function ($slug) use ($nearbyAttractionsController) {
        $nearbyAttractionsController->getByLocationSlug($slug);
    },
    'POST /location-nearby-attractions/' => function () use ($nearbyAttractionsController) {
        $nearbyAttractionsController->create();
    },
    'DELETE /location-nearby-attractions/location/{slug}/' => function ($slug) use ($nearbyAttractionsController) {
        $nearbyAttractionsController->deleteByLocationSlug($slug);
    }
];
