<?php
require_once './models/TourInclusion.php';

class TourInclusionController
{
    private $model;

    public function __construct($pdo)
    {
        $this->model = new TourInclusion($pdo);
    }

    // GET /tour-inclusions/
    public function getAll()
    {
        echo json_encode($this->model->getAll());
    }

    // GET /tour-inclusions/package/{id}/
    public function getByTourPackageId($id)
    {
        $id = (int)$id;
        echo json_encode($this->model->getByTourPackageId($id));
    }

    // POST /tour-inclusions/
    public function create()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        if (
            !$data ||
            !isset($data['tour_package_id'], $data['icon'], $data['title'], $data['description'], $data['sort_order'])
        ) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input. Required fields: tour_package_id, icon, title, description, sort_order']);
            return;
        }

        try {
            // Wrap in array to match model signature
            $this->model->create($data['tour_package_id'], [$data]);

            http_response_code(201);
            echo json_encode([
                'message' => 'Tour inclusion created successfully'
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                'error' => 'Database error: ' . $e->getMessage()
            ]);
        }
    }

    // DELETE /tour-inclusions/package/{id}/
    public function deleteByPackage($id)
    {
        $id = (int)$id;
        $this->model->deleteByTourPackageId($id);
        echo json_encode([
            'message' => "All inclusions deleted for tour package ID: $id"
        ]);
    }
}
