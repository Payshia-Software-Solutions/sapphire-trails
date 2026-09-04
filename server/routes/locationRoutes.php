<?php
require_once __DIR__ . '/../controllers/locationController.php';
require_once __DIR__ . '/../lib/AuthMiddleware.php';

$pdo = $GLOBALS['pdo'];
$locationController = new LocationController($pdo);

return [
    // Public routes
    'GET /locations/' => function () use ($locationController) {
        $locationController->getAll();
    },
    'GET /locations/{slug}/' => function ($slug) use ($locationController) {
        $locationController->getBySlug($slug);
    },

    // Admin protected mutations
    'POST /locations/' => function () use ($locationController) {
        AuthMiddleware::requireAdmin();
        $locationController->create();
    },
    'POST /locations' => function () use ($locationController) {
        AuthMiddleware::requireAdmin();
        $locationController->create();
    },
    'POST /locations/{slug}/' => function ($slug) use ($locationController) {
        AuthMiddleware::requireAdmin();
        $locationController->update($slug);
    },
    'POST /locations/{slug}' => function ($slug) use ($locationController) {
        AuthMiddleware::requireAdmin();
        $locationController->update($slug);
    },
    'PUT /locations/{slug}/' => function ($slug) use ($locationController) {
        AuthMiddleware::requireAdmin();
        $locationController->update($slug);
    },
    'PUT /locations/{slug}' => function ($slug) use ($locationController) {
        AuthMiddleware::requireAdmin();
        $locationController->update($slug);
    },
    'DELETE /locations/{slug}/' => function ($slug) use ($locationController) {
        AuthMiddleware::requireAdmin();
        $locationController->delete($slug);
    },
    'DELETE /locations/{slug}' => function ($slug) use ($locationController) {
        AuthMiddleware::requireAdmin();
        $locationController->delete($slug);
    },
];
