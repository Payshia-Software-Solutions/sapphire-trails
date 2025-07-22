<?php
require_once './controllers/locationgalleryimageController.php';

$pdo = $GLOBALS['pdo'];
$galleryController = new LocationGalleryImageController($pdo);

return [
    'GET /location-gallery/' => function () use ($galleryController) {
        $galleryController->getAll();
    },
    'GET /location-gallery/location/{slug}/' => function ($slug) use ($galleryController) {
        $galleryController->getByLocationSlug($slug);
    },
    'POST /location-gallery/' => function () use ($galleryController) {
        $galleryController->create();
    },
    'DELETE /location-gallery/{id}/' => function($id) use ($galleryController) {
        $galleryController->deleteById($id);
    },
    'POST /location-gallery/{id}' => function($id) use ($galleryController) {
        $galleryController->update($id);
    },
    'DELETE /location-gallery/location/{slug}/' => function ($slug) use ($galleryController) {
        $galleryController->deleteByLocationSlug($slug);
    }
];
