<?php
class TourExperienceGallery
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getByTourPackageId($tour_package_id)
    {
        $stmt = $this->pdo->prepare("SELECT id, image_url, alt_text, hint FROM tour_experience_gallery WHERE tour_package_id = ? ORDER BY sort_order ASC");
        $stmt->execute([$tour_package_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($data)
    {
        $stmt = $this->pdo->prepare("
            INSERT INTO tour_experience_gallery (tour_package_id, image_url, alt_text, hint, sort_order)
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $data['tour_package_id'],
            $data['image_url'],
            $data['alt_text'],
            $data['hint'],
            $data['sort_order'] ?? 0
        ]);
        return $this->pdo->lastInsertId();
    }

    public function deleteByTourPackageId($tour_package_id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM tour_experience_gallery WHERE tour_package_id = ?");
        return $stmt->execute([$tour_package_id]);
    }
    
    public function deleteById($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM tour_experience_gallery WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
?>