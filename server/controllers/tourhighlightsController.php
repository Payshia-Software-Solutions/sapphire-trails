<?php

require_once './models/TourHighlight.php';

class TourHighlightController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new TourHighlight($pdo);
    }

    // GET /tour-highlights/
    public function getAll()
    {
        $items = $this->model->getAll();
        echo json_encode($items);
    }

    // GET /tour-highlights/package/{id}
    public function getByTourPackageId($id)
    {
        $id = (int)$id;
        $items = $this->model->getByTourPackageId($id);

        if (!empty($items)) {
            echo json_encode($items);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'No highlights found for this tour package ID.']);
        }
    }

    // POST /tour-highlights/
    public function create()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        if (
            !$data ||
            !isset($data['tour_package_id']) ||
            !isset($data['highlights']) ||
            !is_array($data['highlights'])
        ) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input. Provide tour_package_id and an array of highlights.']);
            return;
        }

        try {
            $this->model->create((int)$data['tour_package_id'], $data['highlights']);
            http_response_code(201);
            echo json_encode(['message' => 'Highlights created successfully.']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    // DELETE /tour-highlights/package/{id}
    public function deleteByTourPackageId($id)
    {
        $deletedCount = $this->model->deleteByTourPackageId((int)$id);

        if ($deletedCount > 0) {
            echo json_encode(['message' => 'Deleted ' . $deletedCount . ' highlights for tour package ID: ' . $id]);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'No highlights found to delete for this ID.']);
        }
    }
}
