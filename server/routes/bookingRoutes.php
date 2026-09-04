<?php
require_once __DIR__ . '/../controllers/bookingController.php';
require_once __DIR__ . '/../lib/AuthMiddleware.php';

$pdo = $GLOBALS['pdo'];
$bookingController = new BookingController($pdo);

return [
    // Get all bookings (Admin gets all, Client gets their own)
    'GET /bookings/' => function () use ($bookingController) {
        $user = AuthMiddleware::requireAuth();
        $role = $user['role'] ?? ($user['type'] ?? '');
        if (in_array($role, ['admin', 'superadmin'])) {
            $bookingController->getAll();
        } else {
            $bookingController->getMyBookings($user);
        }
    },

    // Get bookings for the currently authenticated user
    'GET /bookings/my/' => function () use ($bookingController) {
        $user = AuthMiddleware::requireAuth();
        $bookingController->getMyBookings($user);
    },


    // Get a single booking by ID (Public confirmation page or Admin)
    'GET /bookings/{id}/' => function ($id) use ($bookingController) {
        $bookingController->getById($id);
    },

    // Create a new booking (Public)
    'POST /bookings/' => function () use ($bookingController) {
        $bookingController->create();
    },

    // Update booking status only (Admin only)
    'PUT /bookings/{id}/status/' => function ($id) use ($bookingController) {
        AuthMiddleware::requireAdmin();
        $bookingController->updateStatus($id);
    },

    // Reschedule booking tour date (Admin only)
    'PUT /bookings/{id}/reschedule/' => function ($id) use ($bookingController) {
        AuthMiddleware::requireAdmin();
        $bookingController->reschedule($id);
    },

    // Customer request to reschedule (Public)
    'POST /bookings/{id}/reschedule-request/' => function ($id) use ($bookingController) {
        $bookingController->reschedule($id);
    },

    // Update admin internal notes (Admin only)
    'PUT /bookings/{id}/notes/' => function ($id) use ($bookingController) {
        AuthMiddleware::requireAdmin();
        $bookingController->updateNotes($id);
    },

    // Full update to booking (Admin only)
    'PUT /bookings/{id}/' => function ($id) use ($bookingController) {
        AuthMiddleware::requireAdmin();
        $bookingController->update($id);
    },

    // Delete a booking (Admin only)
    'DELETE /bookings/{id}/' => function ($id) use ($bookingController) {
        AuthMiddleware::requireAdmin();
        $bookingController->delete($id);
    },
];
