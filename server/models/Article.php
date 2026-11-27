<?php

class Article
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAll($status = null)
    {
        if ($status) {
            $stmt = $this->pdo->prepare("SELECT * FROM `articles` WHERE `status` = ? ORDER BY `created_at` DESC");
            $stmt->execute([$status]);
        } else {
            $stmt = $this->pdo->prepare("SELECT * FROM `articles` ORDER BY `created_at` DESC");
            $stmt->execute();
        }

        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($items as &$item) {
            if (isset($item['key_takeaways']) && is_string($item['key_takeaways'])) {
                $item['key_takeaways'] = json_decode($item['key_takeaways'], true) ?: [];
            }
        }
        return $items;
    }

    public function getById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `articles` WHERE `id` = ?");
        $stmt->execute([$id]);
        $item = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($item && isset($item['key_takeaways']) && is_string($item['key_takeaways'])) {
            $item['key_takeaways'] = json_decode($item['key_takeaways'], true) ?: [];
        }
        return $item ?: null;
    }

    public function getBySlug($slug)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `articles` WHERE `slug` = ?");
        $stmt->execute([$slug]);
        $item = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($item && isset($item['key_takeaways']) && is_string($item['key_takeaways'])) {
            $item['key_takeaways'] = json_decode($item['key_takeaways'], true) ?: [];
        }
        return $item ?: null;
    }

    public function create($data)
    {
        $slug = !empty($data['slug']) ? $this->generateSlug($data['slug']) : $this->generateSlug($data['title']);

        $keyTakeaways = is_array($data['key_takeaways']) 
            ? json_encode($data['key_takeaways']) 
            : ($data['key_takeaways'] ?? json_encode([]));

        $stmt = $this->pdo->prepare("
            INSERT INTO `articles` (
                `slug`, `title`, `subtitle`, `description`, `image_url`, `image_hint`,
                `category`, `read_time`, `published_date`, `author_name`, `author_role`,
                `author_avatar`, `key_takeaways`, `content_html`, `status`, `created_at`, `updated_at`
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        ");

        $stmt->execute([
            $slug,
            $data['title'] ?? '',
            $data['subtitle'] ?? null,
            $data['description'] ?? null,
            $data['image_url'] ?? null,
            $data['image_hint'] ?? null,
            $data['category'] ?? 'General',
            $data['read_time'] ?? '5 min read',
            $data['published_date'] ?? date('F Y'),
            $data['author_name'] ?? 'Editorial Team',
            $data['author_role'] ?? 'Contributor',
            $data['author_avatar'] ?? null,
            $keyTakeaways,
            $data['content_html'] ?? null,
            $data['status'] ?? 'published'
        ]);

        return $this->pdo->lastInsertId();
    }

    public function update($id, $data)
    {
        $existing = $this->getById($id);
        if (!$existing) {
            return false;
        }

        $slug = !empty($data['slug']) ? $this->generateSlug($data['slug'], $id) : $existing['slug'];

        $keyTakeaways = is_array($data['key_takeaways']) 
            ? json_encode($data['key_takeaways']) 
            : ($data['key_takeaways'] ?? json_encode([]));

        $stmt = $this->pdo->prepare("
            UPDATE `articles` SET
                `slug` = ?,
                `title` = ?,
                `subtitle` = ?,
                `description` = ?,
                `image_url` = ?,
                `image_hint` = ?,
                `category` = ?,
                `read_time` = ?,
                `published_date` = ?,
                `author_name` = ?,
                `author_role` = ?,
                `author_avatar` = ?,
                `key_takeaways` = ?,
                `content_html` = ?,
                `status` = ?,
                `updated_at` = NOW()
            WHERE `id` = ?
        ");

        $stmt->execute([
            $slug,
            $data['title'] ?? $existing['title'],
            $data['subtitle'] ?? $existing['subtitle'],
            $data['description'] ?? $existing['description'],
            $data['image_url'] ?? $existing['image_url'],
            $data['image_hint'] ?? $existing['image_hint'],
            $data['category'] ?? $existing['category'],
            $data['read_time'] ?? $existing['read_time'],
            $data['published_date'] ?? $existing['published_date'],
            $data['author_name'] ?? $existing['author_name'],
            $data['author_role'] ?? $existing['author_role'],
            $data['author_avatar'] ?? $existing['author_avatar'],
            $keyTakeaways,
            $data['content_html'] ?? $existing['content_html'],
            $data['status'] ?? $existing['status'],
            $id
        ]);

        return true;
    }

    public function delete($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM `articles` WHERE `id` = ?");
        return $stmt->execute([$id]);
    }

    private function generateSlug($text, $currentId = null)
    {
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $text)));
        $slug = trim($slug, '-');
        if (empty($slug)) {
            $slug = 'article-' . time();
        }

        $sql = "SELECT COUNT(*) FROM `articles` WHERE `slug` = ?";
        $params = [$slug];
        if ($currentId) {
            $sql .= " AND `id` != ?";
            $params[] = $currentId;
        }

        $stmt = $this->pdo->prepare($sql);
        $originalSlug = $slug;
        $i = 1;
        while (true) {
            $stmt->execute($params);
            if ($stmt->fetchColumn() == 0) {
                break;
            }
            $slug = $originalSlug . '-' . $i++;
            $params[0] = $slug;
        }

        return $slug;
    }
}
