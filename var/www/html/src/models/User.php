<?php
class User
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAll()
    {
        $stmt = $this->pdo->query("SELECT id, name, email, phone, type, created_at FROM users");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function getByType($type)
    {
        $stmt = $this->pdo->prepare("SELECT id, name, email, phone, type, created_at FROM users WHERE type = ? ORDER BY created_at DESC");
        $stmt->execute([$type]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById($id)
    {
        $stmt = $this->pdo->prepare("SELECT id, name, email, phone, type, created_at FROM users WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getByEmail($email)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function findOrCreateGuest($data)
    {
        // First, check if a user with this email already exists.
        $existingUser = $this->getByEmail($data['email']);
        if ($existingUser) {
            // If they exist, just return their ID.
            return $existingUser['id'];
        } else {
            // If they don't exist, create a new user record for them.
            return $this->create([
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'password' => bin2hex(random_bytes(16)), // Assign a secure, random password
                'type' => 'client' // Guests are always clients
            ]);
        }
    }

    public function create($data)
    {
        // This method is now safe because findOrCreateGuest prevents duplicates.
        $stmt = $this->pdo->prepare(
            "INSERT INTO users (name, email, phone, password_hash, type) VALUES (?, ?, ?, ?, ?)"
        );

        // Hash the password before storing
        $password_hash = password_hash($data['password'], PASSWORD_DEFAULT);
        
        $stmt->execute([
            $data['name'], 
            $data['email'], 
            $data['phone'] ?? null, 
            $password_hash,
            $data['type'] ?? 'client'
        ]);

        return $this->pdo->lastInsertId();
    }

    public function delete($id) {
        $stmt = $this->pdo->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->rowCount();
    }
}
