<?php
require_once __DIR__ . '/../controllers/analyticsController.php';
require_once __DIR__ . '/../lib/AuthMiddleware.php';

$pdo = $GLOBALS['pdo'];
$analyticsController = new AnalyticsController($pdo);

return [
    // Public config (Active IDs for client script injection)
    'GET /analytics/config/' => function () use ($analyticsController) {
        $analyticsController->getPublicConfig();
    },

    // Get full settings (Admin only)
    'GET /analytics/settings/' => function () use ($analyticsController) {
        AuthMiddleware::requireAdmin();
        $analyticsController->getSettings();
    },

    // Update settings (Admin only)
    'POST /analytics/settings/' => function () use ($analyticsController) {
        AuthMiddleware::requireAdmin();
        $analyticsController->updateSettings();
    },
];
