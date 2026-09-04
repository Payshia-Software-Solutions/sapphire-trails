<?php

class ImageOptimizer
{
    /**
     * Converts an uploaded image to high-quality WebP format.
     * Preserves transparency for PNGs and transparent WebP/GIFs.
     * Quality is set to 88 by default for crisp visuals with optimal compression.
     *
     * @param string $sourcePath Local path to original uploaded image
     * @param string $destinationPath Local path where .webp file should be saved
     * @param int $quality Quality factor (1-100, default 88)
     * @return bool True on success, false on fallback copy failure
     */
    public static function convertToWebP($sourcePath, $destinationPath, $quality = 88)
    {
        if (!file_exists($sourcePath)) {
            return false;
        }

        // Ensure target directory exists
        $destDir = dirname($destinationPath);
        if (!is_dir($destDir)) {
            mkdir($destDir, 0777, true);
        }

        // If GD extension or imagewebp is not available, fallback to direct copy
        if (!function_exists('imagewebp') || !function_exists('getimagesize')) {
            return copy($sourcePath, $destinationPath);
        }

        $imageInfo = @getimagesize($sourcePath);
        if (!$imageInfo) {
            return copy($sourcePath, $destinationPath);
        }

        $mimeType = $imageInfo['mime'];
        $image = null;

        switch ($mimeType) {
            case 'image/jpeg':
            case 'image/jpg':
                if (function_exists('imagecreatefromjpeg')) {
                    $image = @imagecreatefromjpeg($sourcePath);
                }
                break;
            case 'image/png':
                if (function_exists('imagecreatefrompng')) {
                    $image = @imagecreatefrompng($sourcePath);
                    if ($image) {
                        imagepalettetotruecolor($image);
                        imagealphablending($image, false);
                        imagesavealpha($image, true);
                    }
                }
                break;
            case 'image/webp':
                if (function_exists('imagecreatefromwebp')) {
                    $image = @imagecreatefromwebp($sourcePath);
                } else {
                    return copy($sourcePath, $destinationPath);
                }
                break;
            case 'image/gif':
                if (function_exists('imagecreatefromgif')) {
                    $image = @imagecreatefromgif($sourcePath);
                    if ($image) {
                        imagepalettetotruecolor($image);
                        imagealphablending($image, false);
                        imagesavealpha($image, true);
                    }
                }
                break;
            case 'image/bmp':
                if (function_exists('imagecreatefrombmp')) {
                    $image = @imagecreatefrombmp($sourcePath);
                }
                break;
            default:
                return copy($sourcePath, $destinationPath);
        }

        if (!$image) {
            return copy($sourcePath, $destinationPath);
        }

        // Convert and output to WebP with premium quality (88-90)
        $result = @imagewebp($image, $destinationPath, $quality);
        @imagedestroy($image);

        if (!$result || !file_exists($destinationPath) || filesize($destinationPath) === 0) {
            return copy($sourcePath, $destinationPath);
        }

        return true;
    }

    /**
     * Generates a clean, unique WebP filename from any original file name.
     * e.g. "My Proposal Ring Photo.JPG" -> "my-proposal-ring-photo-67c293.webp"
     *
     * @param string $originalName Original file name from client upload
     * @return string Safe unique WebP filename
     */
    public static function generateWebPFileName($originalName)
    {
        $name = pathinfo($originalName, PATHINFO_FILENAME);
        $safeName = preg_replace('/[^a-zA-Z0-9-_]/', '-', strtolower($name));
        $safeName = preg_replace('/-+/', '-', trim($safeName, '-'));
        if (empty($safeName)) {
            $safeName = 'image';
        }
        return $safeName . '-' . uniqid() . '.webp';
    }
}
