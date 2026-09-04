<?php
require_once __DIR__ . '/../controllers/contactController.php';
require_once __DIR__ . '/../lib/AuthMiddleware.php';

$pdo = $GLOBALS['pdo'];
$contactController = new ContactController($pdo);

return [
    // List all contact messages (Admin only)
    'GET /contacts/' => function () use ($contactController) {
        AuthMiddleware::requireAdmin();
        $contactController->getAll();
    },

    // Get by id (Admin only)
    'GET /contacts/{id}/' => function ($id) use ($contactController) {
        AuthMiddleware::requireAdmin();
        $contactController->getById($id);
    },

    // Query by email (Admin only)
    'GET /contacts/by-email/' => function () use ($contactController) {
        AuthMiddleware::requireAdmin();
        $contactController->getByEmail();
    },

    // Create new contact message (Public)
    'POST /contacts/' => function () use ($contactController) {
        $contactController->create();
    },

    // Update (Admin only)
    'PUT /contacts/{id}/' => function ($id) use ($contactController) {
        AuthMiddleware::requireAdmin();
        $contactController->update($id);
    },

    // Update status only (Admin only)
    'PUT /contacts/{id}/status/' => function ($id) use ($contactController) {
        AuthMiddleware::requireAdmin();
        $contactController->updateStatus($id);
    },
    'PATCH /contacts/{id}/status/' => function ($id) use ($contactController) {
        AuthMiddleware::requireAdmin();
        $contactController->updateStatus($id);
    },

    // Reply to inquiry via email (Admin only)
    'POST /contacts/{id}/reply/' => function ($id) use ($contactController) {
        AuthMiddleware::requireAdmin();
        $contactController->reply($id);
    },

    // Delete (Admin only)
    'DELETE /contacts/{id}/' => function ($id) use ($contactController) {
        AuthMiddleware::requireAdmin();
        $contactController->delete($id);
    },
];


