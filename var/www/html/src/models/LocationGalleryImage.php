<?php

class LocationGalleryImage
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAll()
    {
        $stmt = $this->pdo->query("SELECT * FROM location_gallery_images ORDER BY sort_order ASC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getByLocationSlug($slug)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM location_gallery_images WHERE location_slug = ? ORDER BY sort_order ASC");
        $stmt->execute([$slug]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($data)
    {
        $stmt = $this->pdo->prepare("
            INSERT INTO location_gallery_images (location_slug, image_url, alt_text, hint, is_360, sort_order)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $data['location_slug'],
            $data['image_url'],
            $data['alt_text'],
            $data['hint'],
            $data['is_360'],
            $data['sort_order']
        ]);

        return $this->pdo->lastInsertId();
    }

    public function deleteByLocationSlug($slug)
    {
        $stmt = $this->pdo->prepare("DELETE FROM location_gallery_images WHERE location_slug = ?");
        $stmt->execute([$slug]);
    }

    public function deleteById($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM location_gallery_images WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
