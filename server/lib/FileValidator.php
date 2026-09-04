<?php

class FileValidator
{
    private static $allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif'];
    private static $allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/avif',
        'image/gif'
    ];
    private static $maxSizeBytes = 10485760; // 10 MB

    /**
     * Validate an uploaded file array from $_FILES
     * Returns array ['valid' => true] or ['valid' => false, 'error' => '...']
     */
    public static function validateImage(array $file): array
    {
        if (!isset($file['tmp_name']) || $file['error'] !== UPLOAD_ERR_OK) {
            return ['valid' => false, 'error' => 'File upload error code: ' . ($file['error'] ?? 'unknown')];
        }

        if ($file['size'] > self::$maxSizeBytes) {
            return ['valid' => false, 'error' => 'File exceeds maximum allowed size of 10MB'];
        }

        $filename = $file['name'];
        $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));

        if (!in_array($ext, self::$allowedExtensions, true)) {
            return ['valid' => false, 'error' => "Invalid file extension '.$ext'. Allowed: " . implode(', ', self::$allowedExtensions)];
        }

        // Check real MIME type
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!in_array($mime, self::$allowedMimeTypes, true)) {
            return ['valid' => false, 'error' => "Invalid file MIME type '$mime'. Only valid images are permitted"];
        }

        // Check real image header
        $imageInfo = @getimagesize($file['tmp_name']);
        if ($imageInfo === false) {
            return ['valid' => false, 'error' => 'File is not a valid image'];
        }

        return ['valid' => true, 'extension' => $ext, 'mime' => $mime];
    }

    /**
     * Generate safe random filename
     */
    public static function generateSafeFileName(string $originalName): string
    {
        $ext = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
        $name = pathinfo($originalName, PATHINFO_FILENAME);
        $safeName = preg_replace('/[^a-zA-Z0-9_-]/', '', $name);
        if (empty($safeName)) {
            $safeName = 'image';
        }
        $safeName = substr($safeName, 0, 40);
        $random = bin2hex(random_bytes(6));
        return $safeName . '-' . uniqid() . '-' . $random . '.' . $ext;
    }
}
