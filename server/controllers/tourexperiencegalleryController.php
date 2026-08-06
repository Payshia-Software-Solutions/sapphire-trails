<?php
require_once './models/TourExperienceGallery.php';

class TourExperienceGalleryController
{
    private $model;
    private $uploadBasePath = '/path/to/ftp_root/tour-experience-gallery/';

    public function __construct($pdo)
    {
        $this->model = new TourExperienceGallery($pdo);
    }

    public function getByTourPackageId($packageId)
    {
        $images = $this->model->getByTourPackageId($packageId);
        echo json_encode($images);
    }
    

    public function delete($packageId, $id)
    {
        $image = $this->model->getByPackageAndId($packageId, $id);
        if (!$image) {
            http_response_code(404);
            echo json_encode(['error' => 'Image not found']);
            return;
        }

        $imagePath = $this->uploadBasePath . basename($image['image_url']);
        if (file_exists($imagePath)) {
            unlink($imagePath);
        }

        $this->model->deleteByPackageAndId($packageId, $id);
        echo json_encode(['message' => 'Experience gallery image deleted']);
    }

    public function update($packageId, $id)
    {
        // if ($_SERVER['REQUEST_METHOD'] !== 'POST' || strtolower($_POST['_method'] ?? '') !== 'put') {
        //     http_response_code(405);
        //     echo json_encode(['error' => 'Invalid method']);
        //     return;
        // }

        $existing = $this->model->getByPackageAndId($packageId, $id);
        if (!$existing) {
            http_response_code(404);
            echo json_encode(['error' => 'Image not found']);
            return;
        }

        $data = $_POST;
        $fields = ['alt_text', 'hint', 'sort_order'];
        $updateData = [];

        foreach ($fields as $field) {
            if (isset($data[$field])) {
                $updateData[$field] = $data[$field];
            }
        }

        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $fileTmp = $_FILES['image']['tmp_name'];
            $fileName = basename($_FILES['image']['name']);
            $targetPath = $this->uploadBasePath . $fileName;

            if (move_uploaded_file($fileTmp, $targetPath)) {
                // Delete old file
                $oldPath = $this->uploadBasePath . basename($existing['image_url']);
                if (file_exists($oldPath)) {
                    unlink($oldPath);
                }

                $updateData['image_url'] = '/tour-experience-gallery/' . $fileName;
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to upload new image']);
                return;
            }
        } else {
            $updateData['image_url'] = $existing['image_url'];
        }

        try {
            $this->model->update($packageId, $id, $updateData);
            echo json_encode(['message' => 'Image updated successfully']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}
