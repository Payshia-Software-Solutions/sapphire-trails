<?php
require_once __DIR__ . '/../controllers/invoiceController.php';
require_once __DIR__ . '/../lib/AuthMiddleware.php';

$pdo = $GLOBALS['pdo'];
$invoiceController = new InvoiceController($pdo);

return [
    // Get all invoices (Admin only)
    'GET /invoices/' => function () use ($invoiceController) {
        AuthMiddleware::requireAdmin();
        $invoiceController->getAll();
    },

    // Get default billing & bank settings (Admin only)
    'GET /invoices/settings/' => function () use ($invoiceController) {
        AuthMiddleware::requireAdmin();
        $invoiceController->getSettings();
    },

    // Save default billing & bank settings (Admin only)
    'POST /invoices/settings/' => function () use ($invoiceController) {
        AuthMiddleware::requireAdmin();
        $invoiceController->updateSettings();
    },

    // Get single invoice by ID (Admin only)
    'GET /invoices/{id}/' => function ($id) use ($invoiceController) {
        AuthMiddleware::requireAdmin();
        $invoiceController->getById($id);
    },

    // Public / Client view of invoice by Invoice Number (e.g. INV-2026-0001)
    'GET /invoices/by-number/{invoiceNumber}/' => function ($invoiceNumber) use ($invoiceController) {
        $invoiceController->getByNumber($invoiceNumber);
    },

    // Get invoice by linked booking ID (Admin only)
    'GET /invoices/by-booking/{bookingId}/' => function ($bookingId) use ($invoiceController) {
        AuthMiddleware::requireAdmin();
        $invoiceController->getByBookingId($bookingId);
    },

    // Create a new invoice (Admin only)
    'POST /invoices/' => function () use ($invoiceController) {
        AuthMiddleware::requireAdmin();
        $invoiceController->create();
    },

    // Update an invoice (Admin only)
    'PUT /invoices/{id}/' => function ($id) use ($invoiceController) {
        AuthMiddleware::requireAdmin();
        $invoiceController->update($id);
    },

    // Record / Update payment status (Admin only)
    'PUT /invoices/{id}/payment/' => function ($id) use ($invoiceController) {
        AuthMiddleware::requireAdmin();
        $invoiceController->updatePayment($id);
    },

    // Dispatch invoice email to customer (Admin only)
    'POST /invoices/{id}/send-email/' => function ($id) use ($invoiceController) {
        AuthMiddleware::requireAdmin();
        $invoiceController->sendEmail($id);
    },

    // Delete invoice (Admin only)
    'DELETE /invoices/{id}/' => function ($id) use ($invoiceController) {
        AuthMiddleware::requireAdmin();
        $invoiceController->delete($id);
    },
];
