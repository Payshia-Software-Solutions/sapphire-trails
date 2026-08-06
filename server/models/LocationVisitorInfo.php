<?php

class LocationVisitorInfo
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAll()
    {
        $stmt = $this->pdo->query("SELECT * FROM location_visitor_info ORDER BY sort_order ASC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getByLocationSlug($slug)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM location_visitor_info WHERE location_slug = ? ORDER BY sort_order ASC");
        $stmt->execute([$slug]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($data)
    {
        error_log("LocationVisitorInfo create() received: " . print_r($data, true));
        
        $stmt = $this->pdo->prepare("
            INSERT INTO location_visitor_info (location_slug, icon, title, line1, line2, sort_order)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        
        $result = $stmt->execute([
            $data['location_slug'],
            $data['icon'] ?? '', // Default empty string if not provided
            $data['title'] ?? '',
            $data['line1'] ?? $data['description'] ?? '', // Use description as line1 if line1 not provided
            $data['line2'] ?? '', // Default empty string if not provided
            $data['sort_order'] ?? 0 // Default to 0 if not provided
        ]);
        
        if (!$result) {
            error_log("LocationVisitorInfo insert failed: " . print_r($stmt->errorInfo(), true));
            throw new Exception("Failed to insert location visitor info");
        }

        return $this->pdo->lastInsertId();
    }

    public function deleteByLocationSlug($slug)
    {
        $stmt = $this->pdo->prepare("DELETE FROM location_visitor_info WHERE location_slug = ?");
        $stmt->execute([$slug]);
    }
}
