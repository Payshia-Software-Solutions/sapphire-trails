<?php
class Contact
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAll()
    {
        $stmt = $this->pdo->query("SELECT * FROM contact_submissions ORDER BY created_at DESC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM contact_submissions WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create($data)
    {
        if (empty($data['name']) || empty($data['email']) || empty($data['message'])) {
            throw new Exception("Missing required fields: name, email, and message.");
        }

        $stmt = $this->pdo->prepare(
            "INSERT INTO contact_submissions (name, email, message) VALUES (?, ?, ?)"
        );
        
        $stmt->execute([$data['name'], $data['email'], $data['message']]);

        return $this->pdo->lastInsertId();
    }

    public function delete($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM contact_submissions WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->rowCount();
    }
}
?>
