<?php
require_once './models/LocationVisitorInfo.php';

class LocationVisitorInfoController
{
    public $model;

    public function __construct($pdo)
    {
        $this->model = new LocationVisitorInfo($pdo);
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

        if (!$data || !isset($data['location_slug'], $data['icon'], $data['title'], $data['line1'], $data['line2'], $data['sort_order'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input']);
            return;
        }

        $id = $this->model->create($data);

        http_response_code(201);
        echo json_encode(['message' => 'Visitor info created', 'id' => $id]);
    }

    public function deleteByLocationSlug($slug)
    {
        $this->model->deleteByLocationSlug($slug);
        echo json_encode(['message' => 'Visitor info deleted for location slug: ' . $slug]);
    }
}
