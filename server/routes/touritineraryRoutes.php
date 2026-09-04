<?php
require_once './controllers/touritineraryController.php';

$pdo = $GLOBALS['pdo'];
$itineraryController = new TourItineraryController($pdo);

return [
    'GET /tour-itinerary/' => function () use ($itineraryController) {
        $itineraryController->getAll();
    },
    'GET /tour-itinerary/package/{id}/' => function ($id) use ($itineraryController) {
        $itineraryController->getByTourPackageId($id);
    },
    'POST /tour-itinerary/' => function () use ($itineraryController) {
        $itineraryController->create();
    },
    'DELETE /tour-itinerary/package/{id}/' => function ($id) use ($itineraryController) {
        $itineraryController->deleteByPackage($id);
    }
];
