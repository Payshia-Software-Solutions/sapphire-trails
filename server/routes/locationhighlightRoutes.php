<?php
require_once './controllers/locationhighlightController.php';

$pdo = $GLOBALS['pdo'];
$highlightController = new LocationHighlightController($pdo);

return [
    'GET /location-highlights/' => function () use ($highlightController) {
        $highlightController->getAll();
    },
    'GET /location-highlights/location/{slug}/' => function ($slug) use ($highlightController) {
        $highlightController->getByLocationSlug($slug);
    },
    'POST /location-highlights/' => function () use ($highlightController) {
        $highlightController->create();
    },
    'DELETE /location-highlights/location/{slug}/' => function ($slug) use ($highlightController) {
        $highlightController->deleteByLocationSlug($slug);
    }
];
