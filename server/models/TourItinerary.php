<?php

class TourItinerary
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    // Get all itinerary items
    public function getAll()
    {
        $stmt = $this->pdo->query("SELECT * FROM tour_itinerary ORDER BY sort_order ASC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Get itinerary items for a specific tour package
    public function getByTourPackageId($tourPackageId)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM tour_itinerary WHERE tour_package_id = ? ORDER BY sort_order ASC");
        $stmt->execute([$tourPackageId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Create a new itinerary entry
    public function create($data)
    {
        $stmt = $this->pdo->prepare("
            INSERT INTO tour_itinerary (tour_package_id, time, title, description, sort_order)
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $data['tour_package_id'],
            $data['time'],
            $data['title'],
            $data['description'],
            $data['sort_order']
        ]);

        return $this->pdo->lastInsertId();
    }

    // Delete all itinerary items for a specific tour package
    public function deleteByTourPackageId($tourPackageId)
    {
        $stmt = $this->pdo->prepare("DELETE FROM tour_itinerary WHERE tour_package_id = ?");
        $stmt->execute([$tourPackageId]);
    }
}
