<?php
require_once './models/TourPackage.php';
require_once './models/TourHighlights.php';
require_once './models/TourInclusion.php';
require_once './models/TourItinerary.php';
require_once './models/TourExperienceGallery.php';

class TourPackageController
{
    private $model;
    private $ftpConfig;
    private $experienceGallery;

    public function __construct($pdo)
    {
        $tourHighlight = new TourHighlight($pdo);
        $tourInclusion = new TourInclusion($pdo);
        $tourItinerary = new TourItinerary($pdo);
        $experienceGallery = new TourExperienceGallery($pdo);

        $this->model = new TourPackage($pdo, $tourItinerary, $experienceGallery);
        $this->ftpConfig = include('./config/ftp.php');
        $this->experienceGallery = $experienceGallery;
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
        echo $package ? json_encode($package) : json_encode(['error' => 'Tour package not found']);
    }

    public function getBySlug($slug)
    {
        $package = $this->model->getBySlug($slug);
        echo $package ? json_encode($package) : json_encode(['error' => 'Tour package not found']);
    }

    public function create()
    {
        if ($_SERVER['CONTENT_TYPE'] && strpos($_SERVER['CONTENT_TYPE'], 'multipart/form-data') !== false) {
            $data = $_POST;
            $homepageFile = $_FILES['homepage_image'] ?? null;
            $heroFile = $_FILES['hero_image'] ?? null;

            $required = [
                'homepage_title', 'homepage_description',
                'homepage_image_alt', 'homepage_image_hint', 'tour_page_title',
                'duration', 'price', 'price_suffix',
                'hero_image_hint', 'tour_page_description', 'booking_link',
                'highlights', 'inclusions', 'itinerary'
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
            $data['experience_gallery'] = [];

            $data['homepage_image_url'] = 'default_home.jpg';
            $data['hero_image_url'] = 'default_hero.jpg';

            try {
                $packageId = $this->model->create($data);

                if ($homepageFile && $homepageFile['error'] === UPLOAD_ERR_OK) {
                    $fileName = $this->generateUniqueFileName($homepageFile['name']);
                    $localPath = './uploads/' . $fileName;
                    $ftpPath = '/tour-images/' . $packageId . '/' . $fileName;

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

                    move_uploaded_file($heroFile['tmp_name'], $localPath);
                    if ($this->uploadToFTP($localPath, $ftpPath)) {
                        $data['hero_image_url'] = $ftpPath;
                        unlink($localPath);
                    }
                }

                $this->model->updateImagePaths($packageId, $data['homepage_image_url'], $data['hero_image_url']);

                $galleryImages = $_FILES['experience_gallery_images'] ?? null;
                $galleryMeta = json_decode($data['experience_gallery_meta'] ?? '[]', true);

                if ($galleryImages && is_array($galleryImages['name'])) {
                    foreach ($galleryImages['name'] as $index => $originalName) {
                        if ($galleryImages['error'][$index] !== UPLOAD_ERR_OK) continue;

                        $fileName = $this->generateUniqueFileName($originalName);
                        $localPath = './uploads/' . $fileName;
                        $ftpPath = '/tour-images/' . $packageId . '/experience/' . $fileName;

                        move_uploaded_file($galleryImages['tmp_name'][$index], $localPath);
                        if ($this->uploadToFTP($localPath, $ftpPath)) {
                            unlink($localPath);
                            $meta = $galleryMeta[$index] ?? [];
                            $this->experienceGallery->create([
                                'tour_package_id' => $packageId,
                                'image_url' => $ftpPath,
                                'alt_text' => $meta['alt_text'] ?? '',
                                'hint' => $meta['hint'] ?? '',
                                'sort_order' => $meta['sort_order'] ?? $index
                            ]);
                        }
                    }
                }

                $fullPackage = $this->model->getById($packageId);
                $fullPackage['slug_url'] = 'https://yourdomain.com/tours/' . $fullPackage['slug'];

                echo json_encode([
                    'message' => 'Tour package created successfully',
                    'package' => $fullPackage
                ]);
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
        if ($_SERVER['REQUEST_METHOD'] !== 'POST' || strtolower($_POST['_method'] ?? '') !== 'put') {
            http_response_code(405);
            echo json_encode(['error' => 'Invalid request method']);
            return;
        }

        $data = $_POST;
        $homepageFile = $_FILES['homepage_image'] ?? null;
        $heroFile = $_FILES['hero_image'] ?? null;

        $required = [
            'homepage_title', 'homepage_description',
            'homepage_image_alt', 'homepage_image_hint', 'tour_page_title',
            'duration', 'price', 'price_suffix',
            'hero_image_hint', 'tour_page_description', 'booking_link',
            'highlights', 'inclusions', 'itinerary', 'experience_gallery'
        ];

        foreach ($required as $field) {
            if (!isset($data[$field])) {
                http_response_code(400);
                echo json_encode(['error' => "Missing field: $field"]);
                return;
            }
        }

        $existing = $this->model->getById($id);
        if (!$existing) {
            http_response_code(404);
            echo json_encode(['error' => 'Tour package not found']);
            return;
        }

        $data['highlights'] = json_decode($data['highlights'], true);
        $data['inclusions'] = json_decode($data['inclusions'], true);
        $data['itinerary'] = json_decode($data['itinerary'], true);
        
        // This comes from the frontend containing existing images to keep.
        $data['experience_gallery'] = json_decode($data['experience_gallery'], true);

        $data['homepage_image_url'] = $existing['homepage_image_url'];
        $data['hero_image_url'] = $existing['hero_image_url'];

        if ($homepageFile && $homepageFile['error'] === UPLOAD_ERR_OK) {
            $fileName = $this->generateUniqueFileName($homepageFile['name']);
            $localPath = './uploads/' . $fileName;
            $ftpPath = '/tour-images/' . $id . '/' . $fileName;

            move_uploaded_file($homepageFile['tmp_name'], $localPath);
            if ($this->uploadToFTP($localPath, $ftpPath)) {
                $data['homepage_image_url'] = $ftpPath;
                unlink($localPath);
            }
        }

        if ($heroFile && $heroFile['error'] === UPLOAD_ERR_OK) {
            $fileName = $this->generateUniqueFileName($heroFile['name']);
            $localPath = './uploads/' . $fileName;
            $ftpPath = '/tour-images/' . $id . '/' . $fileName;

            move_uploaded_file($heroFile['tmp_name'], $localPath);
            if ($this->uploadToFTP($localPath, $ftpPath)) {
                $data['hero_image_url'] = $ftpPath;
                unlink($localPath);
            }
        }

        try {
            $this->model->update($id, $data);
            $this->model->updateImagePaths($id, $data['homepage_image_url'], $data['hero_image_url']);

            // Handle newly uploaded gallery images
            $galleryImages = $_FILES['experience_gallery_images'] ?? null;
            $galleryMeta = json_decode($data['experience_gallery_meta'] ?? '[]', true);

            if ($galleryImages && is_array($galleryImages['name'])) {
                foreach ($galleryImages['name'] as $index => $originalName) {
                    if ($galleryImages['error'][$index] !== UPLOAD_ERR_OK) continue;

                    $fileName = $this->generateUniqueFileName($originalName);
                    $localPath = './uploads/' . $fileName;
                    $ftpPath = '/tour-images/' . $id . '/experience/' . $fileName;

                    move_uploaded_file($galleryImages['tmp_name'][$index], $localPath);
                    if ($this->uploadToFTP($localPath, $ftpPath)) {
                        unlink($localPath);
                        $meta = $galleryMeta[$index] ?? [];
                        $this->experienceGallery->create([
                            'tour_package_id' => $id,
                            'image_url' => $ftpPath,
                            'alt_text' => $meta['alt_text'] ?? '',
                            'hint' => $meta['hint'] ?? '',
                            'sort_order' => $meta['sort_order'] ?? $index + 100 // place new at end
                        ]);
                    }
                }
            }

            $fullPackage = $this->model->getById($id);
            $fullPackage['slug_url'] = 'https://yourdomain.com/tours/' . $fullPackage['slug'];

            echo json_encode([
                'message' => 'Tour package updated successfully',
                'package' => $fullPackage
            ]);
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
