<?php
require_once __DIR__ . '/../models/Article.php';

class ArticleController
{
    private $model;
    private $ftpConfig;

    public function __construct($pdo)
    {
        $this->model = new Article($pdo);
        if (file_exists(__DIR__ . '/../config/ftp.php')) {
            $this->ftpConfig = include(__DIR__ . '/../config/ftp.php');
        }
    }

    private function formatArticle($row)
    {
        if (!$row) return null;

        $keyTakeaways = $row['key_takeaways'] ?? [];
        if (is_string($keyTakeaways)) {
            $keyTakeaways = json_decode($keyTakeaways, true) ?: [];
        }

        return [
            'id' => (string)$row['id'],
            'slug' => $row['slug'],
            'title' => $row['title'],
            'subtitle' => $row['subtitle'] ?? '',
            'description' => $row['description'] ?? '',
            'imageUrl' => $row['image_url'] ?? '',
            'image_url' => $row['image_url'] ?? '',
            'imageHint' => $row['image_hint'] ?? '',
            'image_hint' => $row['image_hint'] ?? '',
            'category' => $row['category'] ?? '',
            'readTime' => $row['read_time'] ?? '5 min read',
            'read_time' => $row['read_time'] ?? '5 min read',
            'publishedDate' => $row['published_date'] ?? '',
            'published_date' => $row['published_date'] ?? '',
            'author' => [
                'name' => $row['author_name'] ?? 'Editorial Team',
                'role' => $row['author_role'] ?? 'Contributor',
                'avatar' => $row['author_avatar'] ?? ''
            ],
            'author_name' => $row['author_name'] ?? '',
            'author_role' => $row['author_role'] ?? '',
            'author_avatar' => $row['author_avatar'] ?? '',
            'keyTakeaways' => $keyTakeaways,
            'key_takeaways' => $keyTakeaways,
            'contentHtml' => $row['content_html'] ?? '',
            'content_html' => $row['content_html'] ?? '',
            'status' => $row['status'] ?? 'published',
            'created_at' => $row['created_at'] ?? null,
            'updated_at' => $row['updated_at'] ?? null,
        ];
    }

    private function getRequestData()
    {
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
        if (strpos($contentType, 'application/json') !== false) {
            $raw = file_get_contents('php://input');
            return json_decode($raw, true) ?: [];
        }

        if (!empty($_POST)) {
            $data = $_POST;
            if (isset($data['author']) && is_string($data['author'])) {
                $data['author'] = json_decode($data['author'], true);
            }
            if (isset($data['keyTakeaways']) && is_string($data['keyTakeaways'])) {
                $data['keyTakeaways'] = json_decode($data['keyTakeaways'], true);
            }
            if (isset($data['key_takeaways']) && is_string($data['key_takeaways'])) {
                $data['key_takeaways'] = json_decode($data['key_takeaways'], true);
            }
            return $data;
        }

        $raw = file_get_contents('php://input');
        if (!empty($raw)) {
            $decoded = json_decode($raw, true);
            if (is_array($decoded)) return $decoded;
            parse_str($raw, $parsed);
            if (is_array($parsed)) return $parsed;
        }

        return [];
    }

    private function normalizePayload($data)
    {
        $normalized = [
            'slug' => $data['slug'] ?? null,
            'title' => $data['title'] ?? null,
            'subtitle' => $data['subtitle'] ?? null,
            'description' => $data['description'] ?? null,
            'image_url' => $data['imageUrl'] ?? ($data['image_url'] ?? null),
            'image_hint' => $data['imageHint'] ?? ($data['image_hint'] ?? null),
            'category' => $data['category'] ?? 'General',
            'read_time' => $data['readTime'] ?? ($data['read_time'] ?? '5 min read'),
            'published_date' => $data['publishedDate'] ?? ($data['published_date'] ?? date('F Y')),
            'content_html' => $data['contentHtml'] ?? ($data['content_html'] ?? null),
            'status' => $data['status'] ?? 'published',
        ];

        // Author object or individual fields
        if (isset($data['author']) && is_array($data['author'])) {
            $normalized['author_name'] = $data['author']['name'] ?? 'Editorial Team';
            $normalized['author_role'] = $data['author']['role'] ?? 'Contributor';
            $normalized['author_avatar'] = $data['author']['avatar'] ?? null;
        } else {
            $normalized['author_name'] = $data['author_name'] ?? 'Editorial Team';
            $normalized['author_role'] = $data['author_role'] ?? 'Contributor';
            $normalized['author_avatar'] = $data['author_avatar'] ?? null;
        }

        // Key takeaways
        $takeaways = $data['keyTakeaways'] ?? ($data['key_takeaways'] ?? []);
        if (is_string($takeaways)) {
            $takeaways = json_decode($takeaways, true) ?: [];
        }
        $normalized['key_takeaways'] = is_array($takeaways) ? $takeaways : [];

        return $normalized;
    }

    // GET /articles
    public function getAll()
    {
        $status = $_GET['status'] ?? null;
        $items = $this->model->getAll($status);
        $formatted = array_map([$this, 'formatArticle'], $items);
        echo json_encode($formatted);
    }

    // GET /articles/{idOrSlug} or GET /articles/slug/{slug}
    public function getBySlugOrId($identifier)
    {
        $article = null;
        if (is_numeric($identifier)) {
            $article = $this->model->getById($identifier);
        }
        if (!$article) {
            $article = $this->model->getBySlug($identifier);
        }

        if ($article) {
            echo json_encode($this->formatArticle($article));
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Article not found']);
        }
    }

    // POST /articles
    public function create()
    {
        $data = $this->getRequestData();
        if (empty($data['title'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Title is required']);
            return;
        }

        $payload = $this->normalizePayload($data);

        // Check if an image file was uploaded
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $uploadedUrl = $this->handleImageUpload($_FILES['image'], $payload['slug'] ?: 'articles');
            if ($uploadedUrl) {
                $payload['image_url'] = $uploadedUrl;
            }
        }

        try {
            $newId = $this->model->create($payload);
            $article = $this->model->getById($newId);
            http_response_code(201);
            echo json_encode([
                'message' => 'Article created successfully',
                'article' => $this->formatArticle($article)
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create article: ' . $e->getMessage()]);
        }
    }

    // PUT /articles/{idOrSlug} or POST /articles/{idOrSlug}
    public function update($identifier)
    {
        $existing = null;
        if (is_numeric($identifier)) {
            $existing = $this->model->getById($identifier);
        }
        if (!$existing) {
            $existing = $this->model->getBySlug($identifier);
        }

        if (!$existing) {
            http_response_code(404);
            echo json_encode(['error' => 'Article not found']);
            return;
        }

        $data = $this->getRequestData();
        $payload = $this->normalizePayload($data);

        // Keep existing image if not provided
        if (empty($payload['image_url']) && !empty($existing['image_url'])) {
            $payload['image_url'] = $existing['image_url'];
        }

        // Check if a new image file was uploaded
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $uploadedUrl = $this->handleImageUpload($_FILES['image'], $existing['slug']);
            if ($uploadedUrl) {
                $payload['image_url'] = $uploadedUrl;
            }
        }

        try {
            $success = $this->model->update($existing['id'], $payload);
            if ($success) {
                $updated = $this->model->getById($existing['id']);
                echo json_encode([
                    'message' => 'Article updated successfully',
                    'article' => $this->formatArticle($updated)
                ]);
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'Failed to update article']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update article: ' . $e->getMessage()]);
        }
    }

    // DELETE /articles/{idOrSlug}
    public function delete($identifier)
    {
        $existing = null;
        if (is_numeric($identifier)) {
            $existing = $this->model->getById($identifier);
        }
        if (!$existing) {
            $existing = $this->model->getBySlug($identifier);
        }

        if (!$existing) {
            http_response_code(404);
            echo json_encode(['error' => 'Article not found']);
            return;
        }

        try {
            $success = $this->model->delete($existing['id']);
            if ($success) {
                echo json_encode(['message' => 'Article deleted successfully']);
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'Failed to delete article']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete article: ' . $e->getMessage()]);
        }
    }

    private function handleImageUpload($file, $folder)
    {
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
        if (!in_array($extension, $allowedExtensions)) {
            return null;
        }

        $filename = uniqid('art_') . '.' . $extension;
        $localDir = __DIR__ . '/../uploads/';
        if (!is_dir($localDir)) {
            mkdir($localDir, 0755, true);
        }
        $localPath = $localDir . $filename;

        if (move_uploaded_file($file['tmp_name'], $localPath)) {
            if ($this->ftpConfig && !empty($this->ftpConfig['ftp_server'])) {
                $ftpPath = '/article-images/' . $filename;
                if ($this->uploadToFTP($localPath, $ftpPath)) {
                    unlink($localPath);
                    return 'https://content-provider.payshia.com/sapphire-trail' . $ftpPath;
                }
            }
            return '/uploads/' . $filename;
        }

        return null;
    }

    private function uploadToFTP($localFile, $ftpFilePath)
    {
        if (empty($this->ftpConfig['ftp_server'])) return false;

        $conn = @ftp_connect($this->ftpConfig['ftp_server']);
        if (!$conn || !@ftp_login($conn, $this->ftpConfig['ftp_username'], $this->ftpConfig['ftp_password'])) {
            return false;
        }

        ftp_pasv($conn, true);
        $parts = explode('/', dirname($ftpFilePath));
        $dir = '';
        foreach ($parts as $part) {
            if (empty($part)) continue;
            $dir .= '/' . $part;
            if (!@ftp_chdir($conn, $dir)) {
                @ftp_mkdir($conn, $dir);
            }
        }

        $result = @ftp_put($conn, $ftpFilePath, $localFile, FTP_BINARY);
        @ftp_close($conn);
        return $result;
    }
}
