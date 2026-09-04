<?php
require_once __DIR__ . '/User.php';

class Booking
{
    private $pdo;
    private $userModel;

    public function __construct($pdo, $userModel = null)
    {
        $this->pdo = $pdo;
        $this->userModel = $userModel ?: new User($pdo);
    }

    // Fetch all bookings with joined user, tour and invoice data
    public function getAll()
    {
        $stmt = $this->pdo->prepare("
            SELECT b.*, 
                   u.name AS user_name, 
                   u.email AS user_email, 
                   COALESCE(t.tour_page_title, t.homepage_title) AS tour_title,
                   t.homepage_image_url AS tour_image_url,
                   t.hero_image_url AS tour_hero_image,
                   t.duration AS tour_duration,
                   t.price AS tour_price,
                   t.slug AS tour_slug,
                   inv.id AS invoice_id,
                   inv.invoice_number,
                   inv.payment_status AS invoice_payment_status,
                   inv.total_amount AS invoice_total
            FROM bookings b
            LEFT JOIN users u ON b.user_id = u.id
            LEFT JOIN tour_packages t ON b.tour_package_id = t.id
            LEFT JOIN invoices inv ON inv.booking_id = b.id
            ORDER BY b.created_at DESC
        ");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Fetch a single booking by ID
    public function getById($id)
    {
        $stmt = $this->pdo->prepare("
            SELECT b.*, 
                   u.name AS user_name, 
                   u.email AS user_email, 
                   COALESCE(t.tour_page_title, t.homepage_title) AS tour_title,
                   t.homepage_image_url AS tour_image_url,
                   t.hero_image_url AS tour_hero_image,
                   t.duration AS tour_duration,
                   t.price AS tour_price,
                   t.slug AS tour_slug,
                   inv.id AS invoice_id,
                   inv.invoice_number,
                   inv.payment_status AS invoice_payment_status,
                   inv.total_amount AS invoice_total
            FROM bookings b
            LEFT JOIN users u ON b.user_id = u.id
            LEFT JOIN tour_packages t ON b.tour_package_id = t.id
            LEFT JOIN invoices inv ON inv.booking_id = b.id
            WHERE b.id = ?
        ");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Fetch all bookings for a user by email or user ID
    public function getByUser($email, $userId = null)
    {
        $email = trim(strtolower($email));
        $stmt = $this->pdo->prepare("
            SELECT b.*, 
                   u.name AS user_name, 
                   u.email AS user_email, 
                   COALESCE(t.tour_page_title, t.homepage_title) AS tour_title,
                   t.homepage_image_url AS tour_image_url,
                   t.hero_image_url AS tour_hero_image,
                   t.duration AS tour_duration,
                   t.price AS tour_price,
                   t.slug AS tour_slug,
                   inv.id AS invoice_id,
                   inv.invoice_number,
                   inv.payment_status AS invoice_payment_status,
                   inv.total_amount AS invoice_total
            FROM bookings b
            LEFT JOIN users u ON b.user_id = u.id
            LEFT JOIN tour_packages t ON b.tour_package_id = t.id
            LEFT JOIN invoices inv ON inv.booking_id = b.id
            WHERE LOWER(TRIM(b.email)) = ? 
               OR (b.user_id IS NOT NULL AND b.user_id = ?) 
               OR LOWER(TRIM(u.email)) = ?
            ORDER BY b.created_at DESC
        ");
        $stmt->execute([$email, $userId, $email]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }


    // Reschedule booking date
    public function reschedule($id, $newDate, $newEndDate = null, $reason = null)
    {
        $existing = $this->getById($id);
        if (!$existing) return false;

        $originalDate = $existing['original_tour_date'] ?: $existing['tour_date'];

        $stmt = $this->pdo->prepare("
            UPDATE bookings 
            SET 
                original_tour_date = ?,
                tour_date = ?,
                end_date = ?,
                status = 'rescheduled',
                reschedule_reason = ?,
                rescheduled_at = NOW(),
                updated_at = NOW()
            WHERE id = ?
        ");
        return $stmt->execute([$originalDate, $newDate, $newEndDate, $reason, $id]);
    }

    // Create a new booking
    public function create($data)
    {
        $userId = $data['user_id'] ?? null;

        // Auto-create guest user if not logged in
        if (is_null($userId) && isset($data['email'])) {
            $userId = $this->userModel->findOrCreateGuest($data);
        }

        $stmt = $this->pdo->prepare("
            INSERT INTO bookings (
                user_id, tour_package_id, name, email, phone, address, adults, children, guests,
                tour_date, end_date, status, booking_source, external_booking_id, message, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, NOW(), NOW())
        ");

        $stmt->execute([
            $userId,
            $data['tour_package_id'],
            $data['name'],
            $data['email'],
            $data['phone'] ?? null,
            $data['address'] ?? null,
            $data['adults'] ?? 1,
            $data['children'] ?? 0,
            $data['guests'],
            $data['tour_date'],
            $data['end_date'] ?? null,
            $data['booking_source'] ?? 'website',
            $data['external_booking_id'] ?? null,
            $data['message'] ?? null,
        ]);

        return $this->pdo->lastInsertId();
    }

    // Update a booking completely
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
                end_date = :end_date,
                status = :status,
                booking_source = :booking_source,
                external_booking_id = :external_booking_id,
                message = :message,
                admin_notes = :admin_notes,
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
            ':adults' => $data['adults'] ?? 1,
            ':children' => $data['children'] ?? 0,
            ':guests' => $data['guests'],
            ':tour_date' => $data['tour_date'],
            ':end_date' => $data['end_date'] ?? null,
            ':status' => $data['status'],
            ':booking_source' => $data['booking_source'] ?? 'website',
            ':external_booking_id' => $data['external_booking_id'] ?? null,
            ':message' => $data['message'] ?? null,
            ':admin_notes' => $data['admin_notes'] ?? null
        ]);

        return $stmt->rowCount();
    }

    // Update admin internal notes only
    public function updateNotes($id, $adminNotes)
    {
        $stmt = $this->pdo->prepare("
            UPDATE bookings 
            SET admin_notes = ?, updated_at = NOW() 
            WHERE id = ?
        ");
        return $stmt->execute([$adminNotes, $id]);
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

    // Delete a booking
    public function delete($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM bookings WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
