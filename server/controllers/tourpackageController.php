<?php
require_once __DIR__ . '/../models/TourPackage.php';
require_once __DIR__ . '/../models/TourHighlights.php';
require_once __DIR__ . '/../models/TourInclusion.php';
require_once __DIR__ . '/../models/TourItinerary.php';
require_once __DIR__ . '/../models/TourExperienceGallery.php';
require_once __DIR__ . '/../lib/ImageOptimizer.php';


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
        $this->ftpConfig = include(__DIR__ . '/../config/ftp.php');
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
        return ImageOptimizer::generateWebPFileName($originalName);
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
            $data['meta_title'] = $data['meta_title'] ?? $data['metaTitle'] ?? null;
            $data['meta_description'] = $data['meta_description'] ?? $data['metaDescription'] ?? null;
            $data['meta_keywords'] = $data['meta_keywords'] ?? $data['metaKeywords'] ?? null;
            $data['canonical_url'] = $data['canonical_url'] ?? $data['canonicalUrl'] ?? null;

            try {
                $packageId = $this->model->create($data);

                if ($homepageFile && $homepageFile['error'] === UPLOAD_ERR_OK) {
                    $fileName = $this->generateUniqueFileName($homepageFile['name']);
                    $tempPath = './uploads/temp_' . $fileName;
                    $localPath = './uploads/' . $fileName;
                    $ftpPath = '/tour-images/' . $packageId . '/' . $fileName;

                    if (!is_dir('./uploads')) mkdir('./uploads', 0777, true);
                    if (move_uploaded_file($homepageFile['tmp_name'], $tempPath)) {
                        ImageOptimizer::convertToWebP($tempPath, $localPath, 88);
                        @unlink($tempPath);
                        if ($this->uploadToFTP($localPath, $ftpPath)) {
                            $data['homepage_image_url'] = $ftpPath;
                            @unlink($localPath);
                        }
                    }
                }

                if ($heroFile && $heroFile['error'] === UPLOAD_ERR_OK) {
                    $fileName = $this->generateUniqueFileName($heroFile['name']);
                    $tempPath = './uploads/temp_' . $fileName;
                    $localPath = './uploads/' . $fileName;
                    $ftpPath = '/tour-images/' . $packageId . '/' . $fileName;

                    if (!is_dir('./uploads')) mkdir('./uploads', 0777, true);
                    if (move_uploaded_file($heroFile['tmp_name'], $tempPath)) {
                        ImageOptimizer::convertToWebP($tempPath, $localPath, 88);
                        @unlink($tempPath);
                        if ($this->uploadToFTP($localPath, $ftpPath)) {
                            $data['hero_image_url'] = $ftpPath;
                            @unlink($localPath);
                        }
                    }
                }

                $this->model->updateImagePaths($packageId, $data['homepage_image_url'], $data['hero_image_url']);

                $galleryImages = $_FILES['experience_gallery_images'] ?? null;
                $galleryMeta = json_decode($data['experience_gallery_meta'] ?? '[]', true);

                if ($galleryImages && is_array($galleryImages['name'])) {
                    foreach ($galleryImages['name'] as $index => $originalName) {
                        if ($galleryImages['error'][$index] !== UPLOAD_ERR_OK) continue;

                        $fileName = $this->generateUniqueFileName($originalName);
                        $tempPath = './uploads/temp_' . $fileName;
                        $localPath = './uploads/' . $fileName;
                        $ftpPath = '/tour-images/' . $packageId . '/experience/' . $fileName;

                        if (!is_dir('./uploads')) mkdir('./uploads', 0777, true);
                        if (move_uploaded_file($galleryImages['tmp_name'][$index], $tempPath)) {
                            ImageOptimizer::convertToWebP($tempPath, $localPath, 88);
                            @unlink($tempPath);
                            if ($this->uploadToFTP($localPath, $ftpPath)) {
                                @unlink($localPath);
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
    $homepageFile = $_FILES['homepage_image'] ?? $_FILES['image'] ?? null;
    $heroFile = $_FILES['hero_image'] ?? $_FILES['heroImage'] ?? null;

    // Normalize camelCase to snake_case
    $data['homepage_title'] = $data['homepage_title'] ?? $data['homepageTitle'] ?? null;
    $data['homepage_description'] = $data['homepage_description'] ?? $data['homepageDescription'] ?? null;
    $data['homepage_image_alt'] = $data['homepage_image_alt'] ?? $data['imageAlt'] ?? '';
    $data['homepage_image_hint'] = $data['homepage_image_hint'] ?? $data['imageHint'] ?? '';
    $data['tour_page_title'] = $data['tour_page_title'] ?? $data['tourPageTitle'] ?? null;
    $data['duration'] = $data['duration'] ?? null;
    $data['price'] = $data['price'] ?? null;
    $data['price_suffix'] = $data['price_suffix'] ?? $data['priceSuffix'] ?? 'per person';
    $data['hero_image_hint'] = $data['hero_image_hint'] ?? $data['heroImageHint'] ?? '';
    $data['tour_page_description'] = $data['tour_page_description'] ?? $data['tourPageDescription'] ?? null;
    $data['booking_link'] = $data['booking_link'] ?? $data['bookingLink'] ?? '/booking';
    $data['highlights'] = $data['highlights'] ?? $data['tourHighlights'] ?? null;
    $data['inclusions'] = $data['inclusions'] ?? null;
    $data['itinerary'] = $data['itinerary'] ?? null;
    $data['meta_title'] = $data['meta_title'] ?? $data['metaTitle'] ?? null;
    $data['meta_description'] = $data['meta_description'] ?? $data['metaDescription'] ?? null;
    $data['meta_keywords'] = $data['meta_keywords'] ?? $data['metaKeywords'] ?? null;
    $data['canonical_url'] = $data['canonical_url'] ?? $data['canonicalUrl'] ?? null;

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

    $existing = $this->model->getById($id);
    if (!$existing) {
        http_response_code(404);
        echo json_encode(['error' => 'Tour package not found']);
        return;
    }

    $data['highlights'] = json_decode($data['highlights'], true);
    $data['inclusions'] = json_decode($data['inclusions'], true);
    $data['itinerary'] = json_decode($data['itinerary'], true);

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

    $data['meta_title'] = $data['meta_title'] ?? $data['metaTitle'] ?? null;
    $data['meta_description'] = $data['meta_description'] ?? $data['metaDescription'] ?? null;
    $data['meta_keywords'] = $data['meta_keywords'] ?? $data['metaKeywords'] ?? null;
    $data['canonical_url'] = $data['canonical_url'] ?? $data['canonicalUrl'] ?? null;

    try {
        $this->model->update($id, $data);
        $this->model->updateImagePaths($id, $data['homepage_image_url'], $data['hero_image_url']);

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
