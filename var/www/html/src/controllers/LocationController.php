<?php
require_once './models/Location.php';
require_once './models/LocationGalleryImage.php';
require_once './models/LocationHighlight.php';
require_once './models/LocationVisitorInfo.php';
require_once './models/LocationNearbyAttractions.php';

class LocationController
{
    private $model;
    private $ftpConfig;

    public function __construct($pdo)
    {
        $galleryModel = new LocationGalleryImage($pdo);
        $highlightModel = new LocationHighlight($pdo);
        $visitorInfoModel = new LocationVisitorInfo($pdo);
        $nearbyAttractionsModel = new LocationNearbyAttractions($pdo);

        $this->model = new Location(
            $pdo,
            $galleryModel,
            $highlightModel,
            $visitorInfoModel,
            $nearbyAttractionsModel
        );

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

    // GET /locations
    public function getAll()
    {
        echo json_encode($this->model->getAll());
    }

    // GET /locations/{slug}
    public function getBySlug($slug)
    {
        $location = $this->model->getBySlug($slug);
        if ($location) {
            echo json_encode($location);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Location not found']);
        }
    }

    // POST /locations
    public function create()
    {
        if ($_SERVER['CONTENT_TYPE'] && strpos($_SERVER['CONTENT_TYPE'], 'multipart/form-data') !== false) {
            $data = $_POST;
            
            $slug = isset($data['slug']) ? trim($data['slug']) : null;
            if (empty($slug)) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing required field: slug']);
                return;
            }

            $requiredFields = ['title', 'subtitle', 'category', 'card_description', 'distance', 'intro_title', 'intro_description', 'map_embed_url'];
            $missingFields = [];
            foreach ($requiredFields as $field) {
                if (empty($data[$field])) {
                    $missingFields[] = $field;
                }
            }

            if (!empty($missingFields)) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing required fields: ' . implode(', ', $missingFields)]);
                return;
            }

            $cardImage = $_FILES['card_image'] ?? null;
            $heroImage = $_FILES['hero_image'] ?? null;
            $introImage = $_FILES['intro_image'] ?? null;

            $data['card_image_url'] = 'default_card.jpg';
            $data['hero_image_url'] = 'default_hero.jpg';
            $data['intro_image_url'] = 'default_intro.jpg';

            if ($cardImage && $cardImage['error'] === UPLOAD_ERR_OK) {
                $filename = $this->generateUniqueFileName($cardImage['name']);
                $local = './uploads/' . $filename;
                $ftp = '/location-images/' . $slug . '/' . $filename;
                if (move_uploaded_file($cardImage['tmp_name'], $local) && $this->uploadToFTP($local, $ftp)) {
                    $data['card_image_url'] = $ftp;
                    unlink($local);
                }
            }

            if ($heroImage && $heroImage['error'] === UPLOAD_ERR_OK) {
                $filename = $this->generateUniqueFileName($heroImage['name']);
                $local = './uploads/' . $filename;
                $ftp = '/location-images/' . $slug . '/' . $filename;
                if (move_uploaded_file($heroImage['tmp_name'], $local) && $this->uploadToFTP($local, $ftp)) {
                    $data['hero_image_url'] = $ftp;
                    unlink($local);
                }
            }

            if ($introImage && $introImage['error'] === UPLOAD_ERR_OK) {
                $filename = $this->generateUniqueFileName($introImage['name']);
                $local = './uploads/' . $filename;
                $ftp = '/location-images/' . $slug . '/' . $filename;
                if (move_uploaded_file($introImage['tmp_name'], $local) && $this->uploadToFTP($local, $ftp)) {
                    $data['intro_image_url'] = $ftp;
                    unlink($local);
                }
            }

            // Decode JSON fields and set to empty array if not present or invalid
            $data['highlights'] = isset($data['highlights']) && is_string($data['highlights']) ? json_decode($data['highlights'], true) : [];
            $data['visitor_info'] = isset($data['visitor_info']) && is_string($data['visitor_info']) ? json_decode($data['visitor_info'], true) : [];
            $data['nearby_attractions'] = isset($data['nearby_attractions']) && is_string($data['nearby_attractions']) ? json_decode($data['nearby_attractions'], true) : [];

            // Set default image hints if not provided
            $data['card_image_hint'] = $data['card_image_hint'] ?? '';
            $data['hero_image_hint'] = $data['hero_image_hint'] ?? '';
            $data['intro_image_hint'] = $data['intro_image_hint'] ?? '';

            try {
                // Call the model's create method ONCE with the complete data package
                $this->model->create($data);
                $newLocation = $this->model->getBySlug($slug);

                http_response_code(201);
                echo json_encode([
                    'message' => 'Location created successfully',
                    'location' => $newLocation
                ]);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
            }
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Only multipart/form-data is supported']);
        }
    }


    // DELETE /locations/{slug}
    public function delete($slug)
    {
        $existing = $this->model->getBySlug($slug);
        if (!$existing) {
            http_response_code(404);
            echo json_encode(['error' => 'Location not found']);
            return;
        }

        $this->model->delete($slug);
        echo json_encode(['message' => 'Location deleted successfully']);
    }

    // POST /locations/{slug}/ with _method=PUT
    public function update($slug)
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset($_POST['_method']) || strtolower($_POST['_method']) !== 'put') {
            http_response_code(405);
            echo json_encode(['error' => 'Invalid method. Use POST with _method=PUT']);
            return;
        }

        $existing = $this->model->getBySlug($slug);
        if (!$existing) {
            http_response_code(404);
            echo json_encode(['error' => 'Location not found']);
            return;
        }

        $data = $_POST;
        $data['slug'] = $slug; 

        $cardImage = $_FILES['card_image'] ?? null;
        $heroImage = $_FILES['hero_image'] ?? null;
        $introImage = $_FILES['intro_image'] ?? null;

        if ($cardImage && $cardImage['error'] === UPLOAD_ERR_OK) {
            $filename = $this->generateUniqueFileName($cardImage['name']);
            $local = './uploads/' . $filename;
            $ftp = '/location-images/' . $slug . '/' . $filename;
            if (move_uploaded_file($cardImage['tmp_name'], $local)) {
                if ($this->uploadToFTP($local, $ftp)) {
                    $data['card_image_url'] = $ftp;
                    unlink($local);
                }
            }
        }

        if ($heroImage && $heroImage['error'] === UPLOAD_ERR_OK) {
            $filename = $this->generateUniqueFileName($heroImage['name']);
            $local = './uploads/' . $filename;
            $ftp = '/location-images/' . $slug . '/' . $filename;
            if (move_uploaded_file($heroImage['tmp_name'], $local)) {
                if ($this->uploadToFTP($local, $ftp)) {
                    $data['hero_image_url'] = $ftp;
                    unlink($local);
                }
            }
        }

        if ($introImage && $introImage['error'] === UPLOAD_ERR_OK) {
            $filename = $this->generateUniqueFileName($introImage['name']);
            $local = './uploads/' . $filename;
            $ftp = '/location-images/' . $slug . '/' . $filename;
            if (move_uploaded_file($introImage['tmp_name'], $local)) {
                if ($this->uploadToFTP($local, $ftp)) {
                    $data['intro_image_url'] = $ftp;
                    unlink($local);
                }
            }
        }

        // Handle JSON fields
        if (isset($data['highlights']) && is_string($data['highlights'])) {
            $decoded = json_decode($data['highlights'], true);
            $data['highlights'] = $decoded !== null ? $decoded : [];
        } else {
            $data['highlights'] = [];
        }
        
        if (isset($data['visitor_info']) && is_string($data['visitor_info'])) {
            $decoded = json_decode($data['visitor_info'], true);
            $data['visitor_info'] = $decoded !== null ? $decoded : [];
        } else {
            $data['visitor_info'] = [];
        }
        
        if (isset($data['nearby_attractions']) && is_string($data['nearby_attractions'])) {
            $decoded = json_decode($data['nearby_attractions'], true);
            $data['nearby_attractions'] = $decoded !== null ? $decoded : [];
        } else {
            $data['nearby_attractions'] = [];
        }

        $data['card_image_hint'] = $data['card_image_hint'] ?? '';
        $data['hero_image_hint'] = $data['hero_image_hint'] ?? '';
        $data['intro_image_hint'] = $data['intro_image_hint'] ?? '';

        try {
            $this->model->update($slug, $data);
            $updated = $this->model->getBySlug($slug);

            echo json_encode([
                'message' => 'Location updated successfully',
                'location' => $updated
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
        }
    }
}
