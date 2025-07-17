<?php
class Booking
{
    private $pdo;
    private $userModel;

    public function __construct($pdo, $userModel)
    {
        $this->pdo = $pdo;
        $this->userModel = $userModel; // Store the user model
    }

    public function getAll()
    {
        $stmt = $this->pdo->query("SELECT b.*, tp.homepage_title as tour_title FROM bookings b LEFT JOIN tour_packages tp ON b.tour_package_id = tp.id ORDER BY b.created_at DESC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM bookings WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create($data)
    {
        $userId = $data['user_id'] ?? null;

        // If it's a guest booking (no user_id), create a user first
        if (!$userId) {
            // Check if user already exists by email
            $existingUser = $this->userModel->getByEmail($data['email']);
            if ($existingUser) {
                $userId = $existingUser['id'];
            } else {
                // Create a new user with a random password
                $userData = [
                    'name' => $data['name'],
                    'email' => $data['email'],
                    'phone' => $data['phone'] ?? null,
                    'password' => password_hash(bin2hex(random_bytes(8)), PASSWORD_DEFAULT),
                    'type' => 'client'
                ];
                $userId = $this->userModel->create($userData);
            }
        }

        $stmt = $this->pdo->prepare("
            INSERT INTO bookings (user_id, tour_package_id, name, email, phone, guests, tour_date, message, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $userId,
            $data['tour_package_id'],
            $data['name'],
            $data['email'],
            $data['phone'] ?? null,
            $data['guests'],
            $data['tour_date'],
            $data['message'] ?? null,
            'pending' // Default status
        ]);

        return $this->pdo->lastInsertId();
    }
    
    public function update($id, $data) {
        $stmt = $this->pdo->prepare("
            UPDATE bookings SET
                tour_package_id = ?,
                name = ?,
                email = ?,
                phone = ?,
                guests = ?,
                tour_date = ?,
                message = ?,
                status = ?
            WHERE id = ?
        ");
        
        $stmt->execute([
            $data['tour_package_id'],
            $data['name'],
            $data['email'],
            $data['phone'] ?? null,
            $data['guests'],
            $data['tour_date'],
            $data['message'] ?? null,
            $data['status'],
            $id
        ]);
        
        return $stmt->rowCount();
    }

    public function updateStatus($id, $status)
    {
        $stmt = $this->pdo->prepare("UPDATE bookings SET status = ? WHERE id = ?");
        $stmt->execute([$status, $id]);
        return $stmt->rowCount();
    }

    public function delete($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM bookings WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->rowCount();
    }
}
