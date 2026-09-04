<?php
class Contact
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
        $this->ensureSchema();
    }

    /** Ensure status and other optional columns exist in contact table */
    private function ensureSchema()
    {
        try {
            // Check if status column exists
            $checkStatus = $this->pdo->query("SHOW COLUMNS FROM contact LIKE 'status'")->fetch();
            if (!$checkStatus) {
                $this->pdo->exec("ALTER TABLE contact ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'unread' AFTER message");
            }

            // Check if phone column exists
            $checkPhone = $this->pdo->query("SHOW COLUMNS FROM contact LIKE 'phone'")->fetch();
            if (!$checkPhone) {
                $this->pdo->exec("ALTER TABLE contact ADD COLUMN phone VARCHAR(100) NULL AFTER email");
            }

            // Check if tour_interest column exists
            $checkInterest = $this->pdo->query("SHOW COLUMNS FROM contact LIKE 'tour_interest'")->fetch();
            if (!$checkInterest) {
                $this->pdo->exec("ALTER TABLE contact ADD COLUMN tour_interest VARCHAR(255) NULL AFTER phone");
            }

            // Check if subject column exists
            $checkSubject = $this->pdo->query("SHOW COLUMNS FROM contact LIKE 'subject'")->fetch();
            if (!$checkSubject) {
                $this->pdo->exec("ALTER TABLE contact ADD COLUMN subject VARCHAR(255) NULL AFTER tour_interest");
            }
        } catch (\Exception $e) {
            error_log("Contact schema check notice: " . $e->getMessage());
        }
    }

    /** List all contact messages (newest first) */
    public function getAll()
    {
        $stmt = $this->pdo->query("
            SELECT id, name, email, 
                   COALESCE(phone, '') AS phone,
                   COALESCE(tour_interest, '') AS tour_interest,
                   COALESCE(subject, '') AS subject,
                   message, 
                   COALESCE(status, 'unread') AS status, 
                   created_at
            FROM contact
            ORDER BY created_at DESC
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /** Fetch a single contact message by id */
    public function getById($id)
    {
        $stmt = $this->pdo->prepare("
            SELECT id, name, email, 
                   COALESCE(phone, '') AS phone,
                   COALESCE(tour_interest, '') AS tour_interest,
                   COALESCE(subject, '') AS subject,
                   message, 
                   COALESCE(status, 'unread') AS status, 
                   created_at
            FROM contact
            WHERE id = ?
        ");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /** Optional: fetch all messages from a given email */
    public function getByEmail($email)
    {
        $stmt = $this->pdo->prepare("
            SELECT id, name, email, 
                   COALESCE(phone, '') AS phone,
                   COALESCE(tour_interest, '') AS tour_interest,
                   COALESCE(subject, '') AS subject,
                   message, 
                   COALESCE(status, 'unread') AS status, 
                   created_at
            FROM contact
            WHERE email = ?
            ORDER BY created_at DESC
        ");
        $stmt->execute([$email]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /** Create a new contact message */
    public function create($data)
    {
        $status = $data['status'] ?? 'unread';
        $phone = $data['phone'] ?? null;
        $tourInterest = $data['tour_interest'] ?? null;
        $subject = $data['subject'] ?? 'Website Inquiry';

        $stmt = $this->pdo->prepare("
            INSERT INTO contact (name, email, phone, tour_interest, subject, message, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $data['name'],
            $data['email'],
            $phone,
            $tourInterest,
            $subject,
            $data['message'],
            $status
        ]);

        return $this->pdo->lastInsertId();
    }

    /** Update status specifically */
    public function updateStatus($id, $status)
    {
        $validStatuses = ['unread', 'read', 'replied', 'resolved', 'pending'];
        if (!in_array($status, $validStatuses)) {
            $status = 'read';
        }

        $stmt = $this->pdo->prepare("UPDATE contact SET status = ? WHERE id = ?");
        $stmt->execute([$status, $id]);
        return $stmt->rowCount();
    }

    /** Update a contact message (only update provided keys) */
    public function update($id, $data)
    {
        $allowed = ['name', 'email', 'phone', 'tour_interest', 'subject', 'message', 'status'];
        $setParts = [];
        $params = [];

        foreach ($allowed as $field) {
            if (array_key_exists($field, $data)) {
                $setParts[] = "$field = :$field";
                $params[":$field"] = $data[$field];
            }
        }

        if (empty($setParts)) return 0;

        $sql = "UPDATE contact SET " . implode(', ', $setParts) . " WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);
        $params[':id'] = $id;

        $stmt->execute($params);
        return $stmt->rowCount();
    }

    /** Delete a message */
    public function delete($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM contact WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->rowCount();
    }
}

