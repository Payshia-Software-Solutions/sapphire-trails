<?php
require_once './controllers/tourexperiencegalleryController.php';

$pdo = $GLOBALS['pdo'];
$controller = new TourExperienceGalleryController($pdo);

return [
    // Get all experience gallery images by tour package ID
    'GET /experience-gallery/tour/{packageId}/' => function ($packageId) use ($controller) {
        $controller->getByTourPackageId($packageId);
    },

    // Update a specific experience gallery image by package ID and image ID
    'POST /experience-gallery/tour/{packageId}/{id}/' => function ($packageId, $id) use ($controller) {
        $controller->update($packageId, $id);
    },

    // Delete a specific experience gallery image by package ID and image ID
    'DELETE /experience-gallery/tour/{packageId}/{id}/' => function ($packageId, $id) use ($controller) {
        $controller->delete($packageId, $id);
    }
];
