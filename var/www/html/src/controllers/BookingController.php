<?php
require_once './models/Booking.php';

class BookingController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new Booking($pdo);
    }

    public function getAll()
    {
        echo json_encode($this->model->getAll());
    }

    public function getById($id)
    {
        $booking = $this->model->getById($id);
        if ($booking) {
            echo json_encode($booking);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Booking not found']);
        }
    }

    public function create()
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid JSON']);
            return;
        }

        try {
            $newBookingId = $this->model->create($data);
            $newBooking = $this->model->getById($newBookingId);
            http_response_code(201);
            echo json_encode($newBooking);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    public function update($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid JSON']);
            return;
        }

        try {
            $this->model->update($id, $data);
            $updatedBooking = $this->model->getById($id);
            echo json_encode($updatedBooking);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }
    
    public function updateStatus($id)
    {
        $data = json_decode(file_get_contents('php://input'), true);
        if (json_last_error() !== JSON_ERROR_NONE || !isset($data['status'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid request. Status is required.']);
            return;
        }
        
        try {
            $this->model->updateStatus($id, $data['status']);
            echo json_encode(['message' => 'Booking status updated successfully.']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    public function delete($id)
    {
        if ($this->model->delete($id)) {
            echo json_encode(['message' => 'Booking deleted successfully']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Booking not found']);
        }
    }
}
