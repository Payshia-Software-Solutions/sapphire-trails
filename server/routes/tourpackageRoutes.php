<?php
require_once './controllers/tourpackageController.php';

$pdo = $GLOBALS['pdo'];
$controller = new TourPackageController($pdo);

return [
    // Get all tour packages
    'GET /tours/' => function () use ($controller) {
        $controller->getAll();
    },

    // Get tour package by ID (only if numeric)
    'GET /tours/{id}/' => function ($id) use ($controller) {
        if (is_numeric($id)) {
            $controller->getById($id);
        }
    },

    // Get tour package by slug
    'GET /tours/slug/{slug}/' => function ($slug) use ($controller) {
        $controller->getBySlug($slug);
    },

    // Create new tour package with all images (main + experience gallery)
    'POST /tours/' => function () use ($controller) {
        $controller->create();
    },

    // Update tour package (simulate PUT using _method=put)
    'POST /tours/{id}/' => function ($id) use ($controller) {
        $controller->update($id);
    },

    // Delete tour package
    'DELETE /tours/{id}/' => function ($id) use ($controller) {
        $controller->delete($id);
    },
];
