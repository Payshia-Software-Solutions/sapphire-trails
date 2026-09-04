<?php
require_once './models/LocationNearbyAttractions.php';

class LocationNearbyAttractionsController
{
    public $model;

    public function __construct($pdo)
    {
        $this->model = new LocationNearbyAttractions($pdo);
    }

    public function getAll()
    {
        echo json_encode($this->model->getAll());
    }

    public function getByLocationSlug($slug)
    {
        echo json_encode($this->model->getByLocationSlug($slug));
    }

    public function create()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        if (!$data || !isset($data['location_slug'], $data['icon'], $data['name'], $data['distance'], $data['sort_order'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input']);
            return;
        }

        $id = $this->model->create($data);

        http_response_code(201);
        echo json_encode(['message' => 'Nearby attraction created', 'id' => $id]);
    }

    public function deleteByLocationSlug($slug)
    {
        $this->model->deleteByLocationSlug($slug);
        echo json_encode(['message' => 'Nearby attractions deleted for location slug: ' . $slug]);
    }
}
