<?php
require_once './controllers/bookingController.php';

$pdo = $GLOBALS['pdo'];
$bookingController = new BookingController($pdo);

return [
    // Get all bookings
    'GET /bookings/' => function () use ($bookingController) {
        $bookingController->getAll();
    },

    // Get a single booking by ID
    'GET /bookings/{id}/' => function ($id) use ($bookingController) {
        $bookingController->getById($id);
    },

    // Create a new booking
    'POST /bookings/' => function () use ($bookingController) {
        $bookingController->create();
    },

    // Update booking status only (e.g., accept/reject)
    'PUT /bookings/{id}/status/' => function ($id) use ($bookingController) {
        $bookingController->updateStatus($id);
    },

    // Full update to booking (name, address, adults, etc.)
    'PUT /bookings/{id}/' => function ($id) use ($bookingController) {
        $bookingController->update($id);
    },

    // Delete a booking
    'DELETE /bookings/{id}/' => function ($id) use ($bookingController) {
        $bookingController->delete($id);
    },
];
