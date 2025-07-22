<?php
require_once './models/TourPackage.php';
require_once './models/TourHighlights.php';
require_once './models/TourInclusion.php';
require_once './models/TourItinerary.php';

require_once './controllers/TourItineraryController.php';

class TourPackageController
{
    private $model;
    private $ftpConfig;

    public function __construct($pdo)
    {
        $tourHighlight = new TourHighlight($pdo);
        $tourInclusion = new TourInclusion($pdo);
        $tourItinerary = new TourItinerary($pdo);

        $this->model = new TourPackage($pdo, $tourItinerary);
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

    public function getById($id)
    {
        $package = $this->model->getById($id);
        if ($package) {
            echo json_encode($package);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Tour package not found']);
        }
    }
    
    public function getBySlug($slug)
    {
        $package = $this->model->getBySlug($slug);
        if ($package) {
            echo json_encode($package);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Tour package not found']);
        }
    }

    public function create()
    {
        if ($_SERVER['CONTENT_TYPE'] && strpos($_SERVER['CONTENT_TYPE'], 'multipart/form-data') !== false) {
            $data = $_POST;
            $homepageFile = $_FILES['homepage_image'] ?? null;
            $heroFile = $_FILES['hero_image'] ?? null;
            $galleryFiles = $_FILES['experience_gallery_images'] ?? null;

            $required = [
                'homepage_title', 'homepage_description', 'homepage_image_alt', 
                'homepage_image_hint', 'tour_page_title', 'duration', 'price', 
                'price_suffix', 'hero_image_hint', 'tour_page_description', 
                'booking_link', 'highlights', 'inclusions', 'itinerary', 'experience_gallery'
            ];

            foreach ($required as $field) {
                if (!isset($data[$field])) {
                    http_response_code(400);
                    echo json_encode(['error' => "Missing field: $field"]);
                    return;
                }
            }

            $data['highlights'] = json_decode($data['highlights'], true);
            $data['inclusions'] = json_decode($data['inclusions'], true);
            $data['itinerary'] = json_decode($data['itinerary'], true);
            $data['experience_gallery'] = json_decode($data['experience_gallery'], true);

            try {
                $data['homepage_image_url'] = 'default_home.jpg';
                $data['hero_image_url'] = 'default_hero.jpg';

                $packageId = $this->model->create($data);

                if ($homepageFile && $homepageFile['error'] === UPLOAD_ERR_OK) {
                    $fileName = $this->generateUniqueFileName($homepageFile['name']);
                    $localPath = './uploads/' . $fileName;
                    $ftpPath = '/tour-images/' . $packageId . '/' . $fileName;
                    if (!is_dir('./uploads')) mkdir('./uploads', 0777, true);
                    move_uploaded_file($homepageFile['tmp_name'], $localPath);
                    if ($this->uploadToFTP($localPath, $ftpPath)) {
                        $data['homepage_image_url'] = $ftpPath;
                        unlink($localPath);
                    }
                }

                if ($heroFile && $heroFile['error'] === UPLOAD_ERR_OK) {
                    $fileName = $this->generateUniqueFileName($heroFile['name']);
                    $localPath = './uploads/' . $fileName;
                    $ftpPath = '/tour-images/' . $packageId . '/' . $fileName;
                    if (!is_dir('./uploads')) mkdir('./uploads', 0777, true);
                    move_uploaded_file($heroFile['tmp_name'], $localPath);
                    if ($this->uploadToFTP($localPath, $ftpPath)) {
                        $data['hero_image_url'] = $ftpPath;
                        unlink($localPath);
                    }
                }

                $this->model->updateImagePaths($packageId, $data['homepage_image_url'], $data['hero_image_url']);

                // Handle Gallery Images
                if ($galleryFiles && !empty($galleryFiles['name'][0])) {
                    $galleryImageUrls = [];
                    foreach ($galleryFiles['tmp_name'] as $key => $tmpName) {
                        if ($galleryFiles['error'][$key] === UPLOAD_ERR_OK) {
                            $fileName = $this->generateUniqueFileName($galleryFiles['name'][$key]);
                            $localPath = './uploads/' . $fileName;
                            $ftpPath = '/tour-images/' . $packageId . '/gallery/' . $fileName;
                            if (!is_dir('./uploads')) mkdir('./uploads', 0777, true);
                            move_uploaded_file($tmpName, $localPath);

                            if ($this->uploadToFTP($localPath, $ftpPath)) {
                                $galleryImageUrls[] = $ftpPath;
                                unlink($localPath);
                            }
                        }
                    }
                    // Update gallery items in the data array with the new URLs
                    foreach($data['experience_gallery'] as $index => &$item) {
                        if(isset($galleryImageUrls[$index])) {
                            $item['image_url'] = $galleryImageUrls[$index];
                            $item['alt_text'] = $item['alt'];
                        }
                    }
                }
                
                // Clear existing gallery and re-insert with new URLs
                $this->model->updateExperienceGallery($packageId, $data['experience_gallery']);

                $fullPackage = $this->model->getById($packageId);
                http_response_code(201);
                echo json_encode(['message' => 'Tour package created successfully', 'package' => $fullPackage]);

            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
            }
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Only multipart/form-data is supported']);
        }
    }
    
    public function update($id)
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset($_POST['_method']) || $_POST['_method'] !== 'PUT') {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed or missing _method=PUT field.']);
            return;
        }

        $data = $_POST;
        // No file handling for update, as it's not implemented on the frontend for simplicity yet.
        // We'll just update text fields.

        $existingPackage = $this->model->getById($id);
        if (!$existingPackage) {
            http_response_code(404);
            echo json_encode(['error' => 'Tour package not found.']);
            return;
        }

        // Keep existing image URLs
        $data['homepage_image_url'] = $existingPackage['homepage_image_url'];
        $data['hero_image_url'] = $existingPackage['hero_image_url'];
        
        $data['highlights'] = json_decode($data['highlights'], true);
        $data['inclusions'] = json_decode($data['inclusions'], true);
        $data['itinerary'] = json_decode($data['itinerary'], true);
        // We are not updating gallery images on edit for now.
        
        try {
            $this->model->update($id, $data);
            $updatedPackage = $this->model->getById($id);
            echo json_encode($updatedPackage);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }


    public function delete($id)
    {
        $existing = $this->model->getById($id);
        if (!$existing) {
            http_response_code(404);
            echo json_encode(['error' => 'Tour package not found']);
            return;
        }

        $this->model->delete($id);
        echo json_encode(['message' => 'Tour package and related data deleted successfully']);
    }
}
