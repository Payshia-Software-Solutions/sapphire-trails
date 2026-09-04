<?php
require_once './models/TourItinerary.php';

class TourItineraryController
{
    public $model;

    public function __construct($pdo)
    {
        $this->model = new TourItinerary($pdo);
    }

    // GET /tour-itinerary/
    public function getAll()
    {
        $data = $this->model->getAll();
        echo json_encode($data);
    }

    // GET /tour-itinerary/package/{id}
    public function getByTourPackageId($id)
    {
        if (!is_numeric($id)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid tour package ID']);
            return;
        }

        $data = $this->model->getByTourPackageId((int)$id);
        echo json_encode($data);
    }

    // POST /tour-itinerary/
    public function create()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        if (!$data || !isset($data['tour_package_id'], $data['time'], $data['title'], $data['description'], $data['sort_order'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            return;
        }

        $id = $this->model->create($data);

        http_response_code(201);
        echo json_encode([
            'message' => 'Tour itinerary event created successfully',
            'id' => $id
        ]);
    }

    // DELETE /tour-itinerary/package/{id}
    public function deleteByPackage($id)
    {
        if (!is_numeric($id)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid tour package ID']);
            return;
        }

        $this->model->deleteByTourPackageId((int)$id);
        echo json_encode([
            'message' => 'All itinerary items deleted for tour package ID: ' . $id
        ]);
    }
}
