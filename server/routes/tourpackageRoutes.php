<?php
require_once __DIR__ . '/../controllers/tourpackageController.php';
require_once __DIR__ . '/../lib/AuthMiddleware.php';

$pdo = $GLOBALS['pdo'];
$controller = new TourPackageController($pdo);

return [
    // Get all tour packages (Public)
    'GET /tours/' => function () use ($controller) {
        $controller->getAll();
    },

    // Get tour package by ID (Public)
    'GET /tours/{id}/' => function ($id) use ($controller) {
        if (is_numeric($id)) {
            $controller->getById($id);
        }
    },

    // Get tour package by slug (Public)
    'GET /tours/slug/{slug}/' => function ($slug) use ($controller) {
        $controller->getBySlug($slug);
    },

    // Create new tour package (Admin only)
    'POST /tours/' => function () use ($controller) {
        AuthMiddleware::requireAdmin();
        $controller->create();
    },

    // Update tour package (Admin only)
    'POST /tours/{id}/' => function ($id) use ($controller) {
        AuthMiddleware::requireAdmin();
        $controller->update($id);
    },

    // Delete tour package (Admin only)
    'DELETE /tours/{id}/' => function ($id) use ($controller) {
        AuthMiddleware::requireAdmin();
        $controller->delete($id);
    },
];
