<?php

class TourHighlight
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    // Get all highlights (optional: use for admin/debug)
    public function getAll()
    {
        $stmt = $this->pdo->prepare("SELECT * FROM tour_highlights ORDER BY sort_order ASC");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Get highlights by tour_package_id
    public function getByTourPackageId($tourPackageId)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM tour_highlights WHERE tour_package_id = ? ORDER BY sort_order ASC");
        $stmt->execute([(int)$tourPackageId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Insert highlights (bulk insert)
    public function create($tourPackageId, $items)
    {
        $tourPackageId = (int)$tourPackageId;

        foreach ($items as $item) {
            $stmt = $this->pdo->prepare("
                INSERT INTO tour_highlights (tour_package_id, icon, title, description, sort_order)
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

    // Delete highlights for a package
    public function deleteByTourPackageId($tourPackageId)
    {
        $stmt = $this->pdo->prepare("DELETE FROM tour_highlights WHERE tour_package_id = ?");
        $stmt->execute([(int)$tourPackageId]);
        return $stmt->rowCount();
    }
}
