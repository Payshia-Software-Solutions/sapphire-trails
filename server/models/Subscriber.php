<?php

class Subscriber
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    /**
     * Get all subscribers (newest first)
     */
    public function getAll()
    {
        $stmt = $this->pdo->query("
            SELECT id, email, source, status, created_at, updated_at
            FROM subscribers
            ORDER BY created_at DESC
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get single subscriber by ID
     */
    public function getById($id)
    {
        $stmt = $this->pdo->prepare("
            SELECT id, email, source, status, created_at, updated_at
            FROM subscribers
            WHERE id = ?
        ");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Get single subscriber by Email
     */
    public function getByEmail($email)
    {
        $stmt = $this->pdo->prepare("
            SELECT id, email, source, status, created_at, updated_at
            FROM subscribers
            WHERE LOWER(email) = LOWER(?)
        ");
        $stmt->execute([trim($email)]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Create or reactivate a subscriber
     */
    public function createOrUpdate($email, $source = '2026 Gem Buyer Guide Download')
    {
        $normalizedEmail = strtolower(trim($email));
        $cleanSource = trim($source) ?: '2026 Gem Buyer Guide Download';

        $stmt = $this->pdo->prepare("
            INSERT INTO subscribers (email, source, status)
            VALUES (?, ?, 'active')
            ON DUPLICATE KEY UPDATE 
                status = 'active',
                source = IF(source = 'Manual Admin Entry', source, VALUES(source)),
                updated_at = CURRENT_TIMESTAMP
        ");
        $stmt->execute([$normalizedEmail, $cleanSource]);

        return $this->getByEmail($normalizedEmail);
    }

    /**
     * Update subscriber status ('active' or 'unsubscribed')
     */
    public function updateStatus($id, $status)
    {
        $validStatus = in_array($status, ['active', 'unsubscribed'], true) ? $status : 'active';
        $stmt = $this->pdo->prepare("UPDATE subscribers SET status = ? WHERE id = ?");
        $stmt->execute([$validStatus, $id]);
        return $stmt->rowCount();
    }

    /**
     * Delete subscriber
     */
    public function delete($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM subscribers WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->rowCount();
    }

    /**
     * Get active subscriber emails
     */
    public function getActiveSubscribers()
    {
        $stmt = $this->pdo->query("
            SELECT id, email, source, created_at 
            FROM subscribers 
            WHERE status = 'active'
            ORDER BY id ASC
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
