<?php
require_once './models/LocationHighlight.php';

class LocationHighlightController
{
    public $model;

    public function __construct($pdo)
    {
        $this->model = new LocationHighlight($pdo);
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

        if (!$data || !isset($data['location_slug'], $data['icon'], $data['title'], $data['description'], $data['sort_order'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input']);
            return;
        }

        $id = $this->model->create($data);

        http_response_code(201);
        echo json_encode(['message' => 'Location highlight created', 'id' => $id]);
    }

    public function deleteByLocationSlug($slug)
    {
        $this->model->deleteByLocationSlug($slug);
        echo json_encode(['message' => 'Highlights deleted for location slug: ' . $slug]);
    }
}
