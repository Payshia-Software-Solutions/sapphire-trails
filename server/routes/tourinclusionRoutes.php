<?php
require_once './controllers/tourinclusionController.php';

$pdo = $GLOBALS['pdo'];
$inclusionController = new TourInclusionController($pdo);

return [
    'GET /tour-inclusions/' => function () use ($inclusionController) {
        $inclusionController->getAll();
    },
    'GET /tour-inclusions/package/{id}/' => function ($id) use ($inclusionController) {
        $inclusionController->getByTourPackageId($id);
    },
    'POST /tour-inclusions/' => function () use ($inclusionController) {
        $inclusionController->create();
    },
    'DELETE /tour-inclusions/package/{id}/' => function ($id) use ($inclusionController) {
        $inclusionController->deleteByPackage($id);
    }
];
