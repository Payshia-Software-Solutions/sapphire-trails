<?php
require_once __DIR__ . '/../models/LocationGalleryImage.php';
require_once __DIR__ . '/../lib/FileValidator.php';
require_once __DIR__ . '/../lib/ImageOptimizer.php';

class LocationGalleryImageController
{
    private $model;
    private $ftpConfig;

    public function __construct($pdo)
    {
        $this->model = new LocationGalleryImage($pdo);
        $this->ftpConfig = include(__DIR__ . '/../config/ftp.php');
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

        $ftp_conn = @ftp_connect($ftp_server);
        if (!$ftp_conn || !@ftp_login($ftp_conn, $ftp_username, $ftp_password)) {
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
            $slug = preg_replace('/[^a-zA-Z0-9-_]/', '', $_POST['location_slug'] ?? '');
            $file = $_FILES['image'] ?? null;
            $alt = $_POST['alt_text'] ?? '';
            $hint = $_POST['hint'] ?? '';
            $is360 = (int)($_POST['is_360'] ?? 0);
            $order = (int)($_POST['sort_order'] ?? 0);

            if (empty($slug) || !$file) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing location_slug or image file']);
                return;
            }

            // Validate image securely
            $validation = FileValidator::validateImage($file);
            if (!$validation['valid']) {
                http_response_code(400);
                echo json_encode(['error' => $validation['error']]);
                return;
            }

            $filename = ImageOptimizer::generateWebPFileName($file['name']);
            $tempPath = __DIR__ . '/../uploads/temp_' . $filename;
            $localPath = __DIR__ . '/../uploads/' . $filename;
            $ftpPath = '/location-images/' . $slug . '/gallery/' . $filename;

            if (!is_dir(__DIR__ . '/../uploads')) {
                mkdir(__DIR__ . '/../uploads', 0755, true);
            }

            if (!move_uploaded_file($file['tmp_name'], $tempPath)) {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to process uploaded file']);
                return;
            }

            // Convert to high-fidelity WebP
            ImageOptimizer::convertToWebP($tempPath, $localPath, 88);
            @unlink($tempPath);

            if ($this->uploadToFTP($localPath, $ftpPath)) {
                if (file_exists($localPath)) {
                    unlink($localPath);
                }


                $id = $this->model->create([
                    'location_slug' => $slug,
                    'image_url' => $ftpPath,
                    'alt_text' => $alt,
                    'hint' => $hint,
                    'is_360' => $is360,
                    'sort_order' => $order
                ]);

                http_response_code(201);
                echo json_encode([
                    'message' => 'Gallery image uploaded and saved', 
                    'id' => $id,
                    'image_url' => $ftpPath
                ]);
            } else {
                if (file_exists($localPath)) {
                    unlink($localPath);
                }
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

        // If a new file is uploaded, validate and replace
        if ($file && $file['error'] === UPLOAD_ERR_OK) {
            $validation = FileValidator::validateImage($file);
            if (!$validation['valid']) {
                http_response_code(400);
                echo json_encode(['error' => $validation['error']]);
                return;
            }

            $filename = FileValidator::generateSafeFileName($file['name']);
            $localPath = __DIR__ . '/../uploads/' . $filename;
            $ftpPath = '/location-images/' . $image['location_slug'] . '/gallery/' . $filename;

            if (move_uploaded_file($file['tmp_name'], $localPath)) {
                if ($this->uploadToFTP($localPath, $ftpPath)) {
                    if (file_exists($localPath)) unlink($localPath);
                    $updateData['image_url'] = $ftpPath;
                } else {
                    if (file_exists($localPath)) unlink($localPath);
                    http_response_code(500);
                    echo json_encode(['error' => 'FTP upload failed for new image.']);
                    return;
                }
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
