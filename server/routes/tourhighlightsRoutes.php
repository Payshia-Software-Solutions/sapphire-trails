<?php

require_once './controllers/tourhighlightController.php';

$pdo = $GLOBALS['pdo'];
$tourHighlightController = new TourHighlightController($pdo);

return [
    'GET /tour-highlights/' => function () use ($tourHighlightController) {
        $tourHighlightController->getAll();
    },
    'GET /tour-highlights/package/{id}/' => function ($id) use ($tourHighlightController) {
        $tourHighlightController->getByTourPackageId($id);
    },
    'POST /tour-highlights/' => function () use ($tourHighlightController) {
        $tourHighlightController->create();
    },
    'DELETE /tour-highlights/package/{id}/' => function ($id) use ($tourHighlightController) {
        $tourHighlightController->deleteByTourPackageId($id);
    }
];
