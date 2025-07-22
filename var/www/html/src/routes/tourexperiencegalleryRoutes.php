<?php
require_once './controllers/TourExperienceGalleryController.php';

$pdo = $GLOBALS['pdo'];
$controller = new TourExperienceGalleryController($pdo);

return [
    'DELETE /experience-gallery/{id}/' => function($id) use ($controller) {
        $controller->deleteById($id);
    },
];
?>