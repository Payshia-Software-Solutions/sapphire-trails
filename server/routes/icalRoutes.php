<?php
require_once __DIR__ . '/../controllers/icalController.php';
require_once __DIR__ . '/../lib/AuthMiddleware.php';

$pdo = $GLOBALS['pdo'];
$icalController = new ICalController($pdo);

return [
    // Export calendar for a package (Public endpoint for Airbnb/Booking.com)
    'GET /ical/export/{id}/' => function ($id) use ($icalController) {
        $icalController->export($id);
    },

    // Get feeds (Admin only)
    'GET /ical/feeds/' => function () use ($icalController) {
        AuthMiddleware::requireAdmin();
        $icalController->getFeeds();
    },
    'GET /ical/feeds/{id}/' => function ($id) use ($icalController) {
        AuthMiddleware::requireAdmin();
        $icalController->getFeeds($id);
    },

    // Add new OTA feed (Admin only)
    'POST /ical/feeds/' => function () use ($icalController) {
        AuthMiddleware::requireAdmin();
        $icalController->createFeed();
    },

    // Delete OTA feed (Admin only)
    'DELETE /ical/feeds/{id}/' => function ($id) use ($icalController) {
        AuthMiddleware::requireAdmin();
        $icalController->deleteFeed($id);
    },

    // Sync a specific feed (Admin only)
    'POST /ical/sync/feed/{id}/' => function ($id) use ($icalController) {
        AuthMiddleware::requireAdmin();
        $icalController->syncFeed($id);
    },

    // Sync all feeds or package feeds (Admin only)
    'POST /ical/sync/' => function () use ($icalController) {
        AuthMiddleware::requireAdmin();
        $icalController->syncAll();
    },
    'POST /ical/sync/{id}/' => function ($id) use ($icalController) {
        AuthMiddleware::requireAdmin();
        $icalController->syncAll($id);
    },
];
