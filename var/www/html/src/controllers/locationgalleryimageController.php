<?php
require_once './models/LocationGalleryImage.php';

class LocationGalleryImageController
{
    private $model;
    private $ftpConfig;

    public function __construct($pdo)
    {
        $this->model = new LocationGalleryImage($pdo);
        $this->ftpConfig = include('./config/ftp.php');
    }

    private function ensureDirectoryExists($ftp_conn, $dir)
    {
        $parts = explode('/', $dir);
        $path = '';
        foreach ($parts as $part) {
            if (empty($part)) continue;
            $path .= '/' . $part;
            if (!@ftp_chdir($ftp_conn, $path)) {
                if (!ftp_mkdir($ftp_conn, $path)) {
                    throw new Exception("Could not create directory: $path");
                }
            }
        }
    }

    private function uploadToFTP($localFile, $ftpFilePath)
    {
        $ftp_server = $this->ftpConfig['ftp_server'];
        $ftp_username = $this->ftpConfig['ftp_username'];
        $ftp_password = $this->ftpConfig['ftp_password'];

        $ftp_conn = ftp_connect($ftp_server);
        if (!$ftp_conn || !ftp_login($ftp_conn, $ftp_username, $ftp_password)) {
            error_log("FTP connection/login failed");
            return false;
        }

        ftp_pasv($ftp_conn, true);

        try {
            $this->ensureDirectoryExists($ftp_conn, dirname($ftpFilePath));
        } catch (Exception $e) {
            error_log($e->getMessage());
            ftp_close($ftp_conn);
            return false;
        }

        if (!ftp_put($ftp_conn, $ftpFilePath, $localFile, FTP_BINARY)) {
            ftp_close($ftp_conn);
            error_log("FTP upload failed: $localFile");
            return false;
        }

        ftp_close($ftp_conn);
        return true;
    }

    private function generateUniqueFileName($originalName)
    {
        $ext = pathinfo($originalName, PATHINFO_EXTENSION);
        $name = pathinfo($originalName, PATHINFO_FILENAME);
        $safeName = preg_replace('/[^a-zA-Z0-9-_]/', '', $name);
        return $safeName . '-' . uniqid() . '.' . $ext;
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
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';

        if (strpos($contentType, 'multipart/form-data') !== false) {
            $slug = $_POST['location_slug'] ?? null;
            $file = $_FILES['image'] ?? null;
            $alt = $_POST['alt_text'] ?? '';
            $hint = $_POST['hint'] ?? '';
            $is360 = $_POST['is_360'] ?? 0;
            $order = $_POST['sort_order'] ?? 0;

            if (!$slug || !$file || $file['error'] !== UPLOAD_ERR_OK) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing required fields or file error']);
                return;
            }

            $filename = $this->generateUniqueFileName($file['name']);
            $localPath = './uploads/' . $filename;
            $ftpPath = '/location-images/' . $slug . '/gallery/' . $filename;

            if (!is_dir('./uploads')) mkdir('./uploads', 0777, true);
            move_uploaded_file($file['tmp_name'], $localPath);

            if ($this->uploadToFTP($localPath, $ftpPath)) {
                unlink($localPath);

                $id = $this->model->create([
                    'location_slug' => $slug,
                    'image_url' => $ftpPath,
                    'alt_text' => $alt,
                    'hint' => $hint,
                    'is_360' => $is360,
                    'sort_order' => $order
                ]);

                http_response_code(201);
                echo json_encode(['message' => 'Gallery image uploaded and saved', 'id' => $id]);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'FTP upload failed']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Unsupported content type']);
        }
    }
    
    public function update($id)
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST' || strtolower($_POST['_method'] ?? '') !== 'put') {
            http_response_code(405);
            echo json_encode(['error' => 'Invalid request method. Use POST with _method=PUT']);
            return;
        }

        $image = $this->model->getById($id);
        if (!$image) {
            http_response_code(404);
            echo json_encode(['error' => 'Image not found']);
            return;
        }

        $data = $_POST;
        $file = $_FILES['image'] ?? null;

        $updateData = [
            'image_url' => $image['image_url'], // Default to old image
            'alt_text' => $data['alt_text'] ?? $image['alt_text'],
            'hint' => $data['hint'] ?? $image['hint'],
            'is_360' => $data['is_360'] ?? $image['is_360'],
            'sort_order' => $data['sort_order'] ?? $image['sort_order'],
        ];

        // If a new file is uploaded, replace the image
        if ($file && $file['error'] === UPLOAD_ERR_OK) {
            $filename = $this->generateUniqueFileName($file['name']);
            $localPath = './uploads/' . $filename;
            $ftpPath = '/location-images/' . $image['location_slug'] . '/gallery/' . $filename;

            move_uploaded_file($file['tmp_name'], $localPath);
            if ($this->uploadToFTP($localPath, $ftpPath)) {
                unlink($localPath);
                $updateData['image_url'] = $ftpPath;
            } else {
                 http_response_code(500);
                 echo json_encode(['error' => 'FTP upload failed for new image.']);
                 return;
            }
        }
        
        if ($this->model->updateById($id, $updateData)) {
            echo json_encode(['message' => 'Gallery image updated successfully.']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update gallery image in database.']);
        }
    }

    public function deleteByLocationSlug($slug)
    {
        $this->model->deleteByLocationSlug($slug);
        echo json_encode(['message' => 'All gallery images deleted for location slug: ' . $slug]);
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
