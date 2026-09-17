<?php

class Subscriber
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
        $this->ensureSchema();
    }

    /**
     * Create subscribers table if not exists and migrate legacy leads
     */
    private function ensureSchema()
    {
        try {
            $this->pdo->exec("
                CREATE TABLE IF NOT EXISTS subscribers (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    email VARCHAR(255) NOT NULL UNIQUE,
                    source VARCHAR(255) NOT NULL DEFAULT '2026 Gem Buyer Guide Download',
                    status ENUM('active', 'unsubscribed') NOT NULL DEFAULT 'active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_email (email),
                    INDEX idx_status (status)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");

            // One-time automatic migration of any guide downloads stored in contact table
            $count = (int)$this->pdo->query("SELECT COUNT(*) FROM subscribers")->fetchColumn();
            if ($count === 0) {
                $stmt = $this->pdo->query("
                    SELECT email, 'Guide Download (Imported)' AS source, created_at 
                    FROM contact 
                    WHERE LOWER(name) LIKE '%subscriber%' 
                       OR LOWER(message) LIKE '%guide%' 
                       OR LOWER(message) LIKE '%subscriber%'
                       OR LOWER(COALESCE(tour_interest, '')) LIKE '%guide%'
                    GROUP BY email
                ");
                $contacts = $stmt->fetchAll(PDO::FETCH_ASSOC);

                if (!empty($contacts)) {
                    $insertStmt = $this->pdo->prepare("
                        INSERT IGNORE INTO subscribers (email, source, status, created_at)
                        VALUES (?, ?, 'active', ?)
                    ");
                    foreach ($contacts as $c) {
                        if (filter_var($c['email'], FILTER_VALIDATE_EMAIL)) {
                            $insertStmt->execute([
                                strtolower(trim($c['email'])),
                                $c['source'],
                                $c['created_at'] ?: date('Y-m-d H:i:s')
                            ]);
                        }
                    }
                }
            }
        } catch (\Exception $e) {
            error_log("Subscriber schema setup notice: " . $e->getMessage());
        }
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
