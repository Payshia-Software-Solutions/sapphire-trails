<?php
require_once './models/SiteContent.php';

class SiteContentController
{
    private $model;
    private $ftpConfig;

    public function __construct($pdo)
    {
        $this->model = new SiteContent($pdo);
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
    
    private function handleImageUpload($file, $ftpSubDir = 'cms')
    {
        if ($file && $file['error'] === UPLOAD_ERR_OK) {
            $filename = $this->generateUniqueFileName($file['name']);
            $localPath = './uploads/' . $filename;
            $ftpPath = '/' . $ftpSubDir . '/' . $filename;

            if (!is_dir('./uploads')) mkdir('./uploads', 0777, true);
            move_uploaded_file($file['tmp_name'], $localPath);

            if ($this->uploadToFTP($localPath, $ftpPath)) {
                unlink($localPath);
                return $ftpPath; // Return the FTP path on success
            }
        }
        return null; // Return null on failure or if no file
    }
    
    public function getSection($section_key)
    {
        $content = $this->model->get($section_key);
        if ($content !== null) {
            echo json_encode($content);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Content section not found.']);
        }
    }

    public function updateSection($section_key)
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
             http_response_code(405);
             echo json_encode(['error' => 'Method Not Allowed']);
             return;
        }

        $data = $_POST;
        $files = $_FILES;
        
        $currentContent = $this->model->get($section_key) ?: [];

        if (isset($data['content'])) {
            $contentData = json_decode($data['content'], true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid JSON in content field.']);
                return;
            }
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Missing content field.']);
            return;
        }

        // Handle image uploads and update the content data with new URLs
        foreach ($files as $key => $file) {
            $newImageUrl = $this->handleImageUpload($file);
            if ($newImageUrl) {
                // The key from the form-data should point to where the URL needs to be stored.
                // e.g., key 'hero.imageUrl' would update $contentData['hero']['imageUrl']
                $keys = explode('.', $key);
                $temp = &$contentData;
                foreach ($keys as $k) {
                    if (!isset($temp[$k])) {
                        $temp[$k] = []; // Create nested structure if it doesn't exist
                    }
                    $temp = &$temp[$k];
                }
                $temp = $newImageUrl; // Assign the new URL
                unset($temp);
            }
        }

        try {
            $this->model->update($section_key, $contentData);
            // After saving, fetch the data again to ensure we return the complete, latest version
            $updatedData = $this->model->get($section_key);
            echo json_encode(['success' => true, 'message' => 'Content updated successfully.', 'data' => $updatedData]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}
?>