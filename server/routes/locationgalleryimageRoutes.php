<?php
require_once __DIR__ . '/../controllers/locationgalleryimageController.php';
require_once __DIR__ . '/../lib/AuthMiddleware.php';

$pdo = $GLOBALS['pdo'];
$galleryController = new LocationGalleryImageController($pdo);

return [
    // Public routes
    'GET /location-gallery/' => function () use ($galleryController) {
        $galleryController->getAll();
    },
    'GET /location-gallery/location/{slug}/' => function ($slug) use ($galleryController) {
        $galleryController->getByLocationSlug($slug);
    },

    // Admin protected mutations
    'POST /location-gallery/' => function () use ($galleryController) {
        AuthMiddleware::requireAdmin();
        $galleryController->create();
    },
    'POST /location-gallery/{id}' => function($id) use ($galleryController) {
        AuthMiddleware::requireAdmin();
        $galleryController->update($id);
    },
    'DELETE /location-gallery/{id}' => function($id) use ($galleryController) {
        AuthMiddleware::requireAdmin();
        $galleryController->deleteById($id);
    },
    'DELETE /location-gallery/location/{slug}/' => function ($slug) use ($galleryController) {
        AuthMiddleware::requireAdmin();
        $galleryController->deleteByLocationSlug($slug);
    }
];
