<?php

class LocationNearbyAttractions
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAll()
    {
        $stmt = $this->pdo->query("SELECT * FROM location_nearby_attractions ORDER BY sort_order ASC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getByLocationSlug($slug)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM location_nearby_attractions WHERE location_slug = ? ORDER BY sort_order ASC");
        $stmt->execute([$slug]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($data)
    {
        error_log("LocationNearbyAttractions create() received: " . print_r($data, true));
        
        $stmt = $this->pdo->prepare("
            INSERT INTO location_nearby_attractions (location_slug, icon, name, distance, sort_order)
            VALUES (?, ?, ?, ?, ?)
        ");
        
        $result = $stmt->execute([
            $data['location_slug'],
            $data['icon'] ?? '', // Default empty string if not provided
            $data['name'] ?? '',
            $data['distance'] ?? '',
            $data['sort_order'] ?? 0 // Default to 0 if not provided
        ]);
        
        if (!$result) {
            error_log("LocationNearbyAttractions insert failed: " . print_r($stmt->errorInfo(), true));
            throw new Exception("Failed to insert location nearby attraction");
        }

        return $this->pdo->lastInsertId();
    }

    public function deleteByLocationSlug($slug)
    {
        $stmt = $this->pdo->prepare("DELETE FROM location_nearby_attractions WHERE location_slug = ?");
        $stmt->execute([$slug]);
    }
}