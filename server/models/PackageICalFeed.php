<?php

class PackageICalFeed
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    // Get all feeds, optionally joined with package title
    public function getAll()
    {
        $stmt = $this->pdo->prepare("
            SELECT f.*, t.homepage_title AS tour_title
            FROM package_ical_feeds f
            LEFT JOIN tour_packages t ON f.tour_package_id = t.id
            ORDER BY f.created_at DESC
        ");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Get feeds for a specific package
    public function getByPackageId($packageId)
    {
        $stmt = $this->pdo->prepare("
            SELECT * FROM package_ical_feeds
            WHERE tour_package_id = ?
            ORDER BY created_at DESC
        ");
        $stmt->execute([$packageId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Get single feed by ID
    public function getById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM package_ical_feeds WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Create a new feed
    public function create($data)
    {
        $stmt = $this->pdo->prepare("
            INSERT INTO package_ical_feeds (
                tour_package_id, platform, feed_name, feed_url, sync_status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, 'pending', NOW(), NOW())
        ");
        $stmt->execute([
            $data['tour_package_id'],
            $data['platform'] ?? 'other',
            $data['feed_name'] ?? null,
            $data['feed_url']
        ]);
        return $this->pdo->lastInsertId();
    }

    // Update feed details
    public function update($id, $data)
    {
        $stmt = $this->pdo->prepare("
            UPDATE package_ical_feeds
            SET platform = ?, feed_name = ?, feed_url = ?, updated_at = NOW()
            WHERE id = ?
        ");
        return $stmt->execute([
            $data['platform'] ?? 'other',
            $data['feed_name'] ?? null,
            $data['feed_url'],
            $id
        ]);
    }

    // Update sync status
    public function updateSyncStatus($id, $status, $errorMessage = null)
    {
        $stmt = $this->pdo->prepare("
            UPDATE package_ical_feeds
            SET sync_status = ?, last_error_message = ?, last_synced_at = NOW(), updated_at = NOW()
            WHERE id = ?
        ");
        return $stmt->execute([$status, $errorMessage, $id]);
    }

    // Delete feed
    public function delete($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM package_ical_feeds WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
