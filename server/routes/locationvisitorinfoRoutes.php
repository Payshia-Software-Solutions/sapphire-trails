<?php
require_once './controllers/locationvisitorinfoController.php';

$pdo = $GLOBALS['pdo'];
$visitorInfoController = new LocationVisitorInfoController($pdo);

return [
    'GET /location-visitor-info/' => function () use ($visitorInfoController) {
        $visitorInfoController->getAll();
    },
    'GET /location-visitor-info/location/{slug}/' => function ($slug) use ($visitorInfoController) {
        $visitorInfoController->getByLocationSlug($slug);
    },
    'POST /location-visitor-info/' => function () use ($visitorInfoController) {
        $visitorInfoController->create();
    },
    'DELETE /location-visitor-info/location/{slug}/' => function ($slug) use ($visitorInfoController) {
        $visitorInfoController->deleteByLocationSlug($slug);
    }
];
