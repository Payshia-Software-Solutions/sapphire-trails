<?php
require_once './controllers/TourPackageController.php';

$pdo = $GLOBALS['pdo'];
$controller = new TourPackageController($pdo);

return [
    'GET /tours/' => function () use ($controller) {
        $controller->getAll();
    },
    'GET /tours/{id}/' => function ($id) use ($controller) {
        // Ensure this is treated as a numeric ID to avoid conflict with slug
        if (is_numeric($id)) {
            $controller->getById($id);
        }
    },
    'GET /tours/slug/{slug}/' => function ($slug) use ($controller) {
        $controller->getBySlug($slug);
    },
    'POST /tours/' => function () use ($controller) {
        $controller->create();
    },
    'DELETE /tours/{id}/' => function ($id) use ($controller) {
        $controller->delete($id);
    },
];
