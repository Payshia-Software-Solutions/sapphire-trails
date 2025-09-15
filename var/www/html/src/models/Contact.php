<?php
class Contact
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    /** List all contact messages (newest first) */
    public function getAll()
    {
        $stmt = $this->pdo->query("
            SELECT id, name, email, message, created_at
            FROM contact
            ORDER BY created_at DESC
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /** Fetch a single contact message by id */
    public function getById($id)
    {
        $stmt = $this->pdo->prepare("
            SELECT id, name, email, message, created_at
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
            SELECT id, name, email, message, created_at
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
        $stmt = $this->pdo->prepare("
            INSERT INTO contact (name, email, message)
            VALUES (?, ?, ?)
        ");
        $stmt->execute([
            $data['name'],
            $data['email'],
            $data['message']
        ]);

        return $this->pdo->lastInsertId();
    }

    /** Update a contact message (rare, but handy for admin notes/fixes) */
    public function update($id, $data)
    {
        // Build dynamic SET clause (only update provided keys)
        $allowed = ['name', 'email', 'message'];
        $setParts = [];
        $params = [];

        foreach ($allowed as $field) {
            if (array_key_exists($field, $data)) {
                $setParts[] = "$field = :$field";
                $params[":$field"] = $data[$field];
            }
        }

        if (empty($setParts)) return 0; // nothing to update

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
