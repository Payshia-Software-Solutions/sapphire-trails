<?php
require_once './models/TourExperienceGallery.php';

class TourExperienceGalleryController
{
    private $model;
    
    public function __construct($pdo)
    {
        $this->model = new TourExperienceGallery($pdo);
    }
    
    public function deleteById($id)
    {
        if ($this->model->deleteById($id)) {
            echo json_encode(['message' => 'Gallery image deleted successfully']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Gallery image not found or could not be deleted']);
        }
    }
}
?>