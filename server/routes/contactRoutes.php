<?php
// Adjust the path to match your project
require_once './controllers/contactController.php';

$pdo = $GLOBALS['pdo'];
$contactController = new ContactController($pdo);

return [
    // List all contact messages
    'GET /contacts/' => function () use ($contactController) {
        $contactController->getAll();
    },

    // Get by id
    'GET /contacts/{id}/' => function ($id) use ($contactController) {
        $contactController->getById($id);
    },

    // Optional: query by email -> /contacts/by-email/?email=john@example.com
    'GET /contacts/by-email/' => function () use ($contactController) {
        $contactController->getByEmail();
    },

    // Create new contact message
    'POST /contacts/' => function () use ($contactController) {
        $contactController->create();
    },

    // Update (optional)
    'PUT /contacts/{id}/' => function ($id) use ($contactController) {
        $contactController->update($id);
    },

    // Delete
    'DELETE /contacts/{id}/' => function ($id) use ($contactController) {
        $contactController->delete($id);
    },
];
