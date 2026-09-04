<?php

class TourInclusion
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    // Get all inclusions (optionally useful for admin)
    public function getAll()
    {
        $stmt = $this->pdo->query("SELECT * FROM tour_inclusions ORDER BY sort_order ASC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Get inclusions for a specific tour package
    public function getByTourPackageId($tourPackageId)
    {
        $stmt = $this->pdo->prepare("
            SELECT * FROM tour_inclusions 
            WHERE tour_package_id = ? 
            ORDER BY sort_order ASC
        ");
        $stmt->execute([(int)$tourPackageId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Create multiple inclusions for a tour package
    public function create($tourPackageId, $items)
    {
        $tourPackageId = (int)$tourPackageId;

        foreach ($items as $item) {
            $stmt = $this->pdo->prepare("
                INSERT INTO tour_inclusions (tour_package_id, icon, title, description, sort_order)
                VALUES (?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $tourPackageId,
                $item['icon'],
                $item['title'],
                $item['description'],
                $item['sort_order']
            ]);
        }

        return true;
    }

    // Delete all inclusions for a tour package
    public function deleteByTourPackageId($tourPackageId)
    {
        $stmt = $this->pdo->prepare("DELETE FROM tour_inclusions WHERE tour_package_id = ?");
        $stmt->execute([(int)$tourPackageId]);
    }
}
