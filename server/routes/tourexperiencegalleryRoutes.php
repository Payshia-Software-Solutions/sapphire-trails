<?php
require_once __DIR__ . '/../controllers/tourexperiencegalleryController.php';
require_once __DIR__ . '/../lib/AuthMiddleware.php';

$pdo = $GLOBALS['pdo'];
$controller = new TourExperienceGalleryController($pdo);

return [
    // Get all experience gallery images by tour package ID (Public)
    'GET /experience-gallery/tour/{packageId}/' => function ($packageId) use ($controller) {
        $controller->getByTourPackageId($packageId);
    },

    // Update experience gallery image (Admin only)
    'POST /experience-gallery/tour/{packageId}/{id}/' => function ($packageId, $id) use ($controller) {
        AuthMiddleware::requireAdmin();
        $controller->update($packageId, $id);
    },

    // Delete experience gallery image (Admin only)
    'DELETE /experience-gallery/tour/{packageId}/{id}/' => function ($packageId, $id) use ($controller) {
        AuthMiddleware::requireAdmin();
        $controller->delete($packageId, $id);
    }
];
