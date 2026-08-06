<?php
// Fixed LocationHighlight Model
class LocationHighlight
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAll()
    {
        $stmt = $this->pdo->query("SELECT * FROM location_highlights ORDER BY sort_order ASC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getByLocationSlug($slug)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM location_highlights WHERE location_slug = ? ORDER BY sort_order ASC");
        $stmt->execute([$slug]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($data)
    {
        error_log("LocationHighlight create() received: " . print_r($data, true));
        
        $stmt = $this->pdo->prepare("
            INSERT INTO location_highlights (location_slug, icon, title, description, sort_order)
            VALUES (?, ?, ?, ?, ?)
        ");
        
        $result = $stmt->execute([
            $data['location_slug'],
            $data['icon'] ?? '', // Default empty string if not provided
            $data['title'] ?? '',
            $data['description'] ?? '',
            $data['sort_order'] ?? 0 // Default to 0 if not provided
        ]);
        
        if (!$result) {
            error_log("LocationHighlight insert failed: " . print_r($stmt->errorInfo(), true));
            throw new Exception("Failed to insert location highlight");
        }

        return $this->pdo->lastInsertId();
    }

    public function deleteByLocationSlug($slug)
    {
        $stmt = $this->pdo->prepare("DELETE FROM location_highlights WHERE location_slug = ?");
        $stmt->execute([$slug]);
    }
}
