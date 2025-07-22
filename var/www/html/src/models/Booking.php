<?php
require_once __DIR__ . '/User.php';

class Booking
{
    private $pdo;
    private $userModel;

    public function __construct($pdo, $userModel)
    {
        $this->pdo = $pdo;
        $this->userModel = $userModel;
    }

    // Get all bookings with joined user and tour info
    public function getAll()
    {
        $stmt = $this->pdo->prepare("
            SELECT b.*, 
                   u.name AS user_name, 
                   u.email AS user_email, 
                   t.homepage_title AS tour_title
            FROM bookings b
            LEFT JOIN users u ON b.user_id = u.id
            LEFT JOIN tour_packages t ON b.tour_package_id = t.id
            ORDER BY b.created_at DESC
        ");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Get single booking by ID
    public function getById($id)
    {
        $stmt = $this->pdo->prepare("
            SELECT b.*, 
                   u.name AS user_name, 
                   u.email AS user_email, 
                   t.homepage_title AS tour_title
            FROM bookings b
            LEFT JOIN users u ON b.user_id = u.id
            LEFT JOIN tour_packages t ON b.tour_package_id = t.id
            WHERE b.id = ?
        ");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Create a new booking, handling both registered and guest users
    public function create($data)
    {
        $userId = $data['user_id'] ?? null;

        // If it's a guest booking (no user_id provided), find or create a user.
        if (is_null($userId) && isset($data['email'])) {
            $userId = $this->userModel->findOrCreateGuest($data);
        }

        $stmt = $this->pdo->prepare("
            INSERT INTO bookings (
                user_id, tour_package_id, name, email, phone, address, adults, children, guests,
                tour_date, status, message, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, NOW(), NOW())
        ");

        $stmt->execute([
            $userId, 
            $data['tour_package_id'], 
            $data['name'],
            $data['email'], 
            $data['phone'] ?? null,
            $data['address'] ?? null,
            $data['adults'] ?? 0,
            $data['children'] ?? 0,
            $data['guests'],
            $data['tour_date'], 
            $data['message'] ?? null
        ]);

        return $this->pdo->lastInsertId();
    }

    // Update full booking
    public function update($id, $data)
    {
        $stmt = $this->pdo->prepare("
            UPDATE bookings 
            SET 
                name = :name,
                email = :email,
                phone = :phone,
                address = :address,
                tour_package_id = :tour_package_id,
                adults = :adults,
                children = :children,
                guests = :guests,
                tour_date = :tour_date,
                status = :status,
                message = :message,
                updated_at = NOW()
            WHERE id = :id
        ");

        $stmt->execute([
            ':id' => $id,
            ':name' => $data['name'],
            ':email' => $data['email'],
            ':phone' => $data['phone'] ?? null,
            ':address' => $data['address'] ?? null,
            ':tour_package_id' => $data['tour_package_id'],
            ':adults' => $data['adults'] ?? 0,
            ':children' => $data['children'] ?? 0,
            ':guests' => ($data['adults'] ?? 0) + ($data['children'] ?? 0),
            ':tour_date' => $data['tour_date'],
            ':status' => $data['status'],
            ':message' => $data['message'] ?? null
        ]);

        return $stmt->rowCount();
    }

    // Update status only
    public function updateStatus($id, $status)
    {
        $stmt = $this->pdo->prepare("
            UPDATE bookings 
            SET status = ?, updated_at = NOW() 
            WHERE id = ?
        ");
        $stmt->execute([$status, $id]);
    }

    // Delete booking
    public function delete($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM bookings WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->rowCount();
    }
}
