<?php
require_once __DIR__ . '/../controllers/subscriberController.php';
require_once __DIR__ . '/../lib/AuthMiddleware.php';

$pdo = $GLOBALS['pdo'];
$subscriberController = new SubscriberController($pdo);

return [
    // List all subscribers (Admin only)
    'GET /subscribers/' => function () use ($subscriberController) {
        AuthMiddleware::requireAdmin();
        $subscriberController->getAll();
    },

    // Create / Subscribe new email (Public and Admin)
    'POST /subscribers/' => function () use ($subscriberController) {
        $subscriberController->create();
    },

    // Toggle / Update subscriber status (Admin only)
    'PUT /subscribers/{id}/status/' => function ($id) use ($subscriberController) {
        AuthMiddleware::requireAdmin();
        $subscriberController->updateStatus($id);
    },
    'PATCH /subscribers/{id}/status/' => function ($id) use ($subscriberController) {
        AuthMiddleware::requireAdmin();
        $subscriberController->updateStatus($id);
    },

    // Delete subscriber (Admin only)
    'DELETE /subscribers/{id}/' => function ($id) use ($subscriberController) {
        AuthMiddleware::requireAdmin();
        $subscriberController->delete($id);
    },

    // Send Mass Broadcast Email (Admin only)
    'POST /subscribers/broadcast/' => function () use ($subscriberController) {
        AuthMiddleware::requireAdmin();
        $subscriberController->broadcast();
    },
];
