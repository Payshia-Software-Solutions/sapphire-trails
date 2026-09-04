<?php

class Admin
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    // Get all admins
    public function getAllAdmins()
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `admins`");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Get admin by ID
    public function getAdminById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `admins` WHERE `id` = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Get admin by username (for login)
    public function getAdminByUsername($username)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM `admins` WHERE `username` = ?");
        $stmt->execute([$username]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Create a new admin
    public function createAdmin($data)
    {
        $stmt = $this->pdo->prepare("
            INSERT INTO `admins` (`username`, `password_hash`, `role`, `created_at`)
            VALUES (?, ?, ?, ?)
        ");

        $stmt->execute([
            $data['username'],
            $data['password_hash'],
            $data['role'],
            date('Y-m-d H:i:s') // created_at
        ]);

        return $this->pdo->lastInsertId(); // Return new admin ID
    }

    // Update admin by ID
    public function updateAdmin($id, $data)
    {
        $stmt = $this->pdo->prepare("
            UPDATE `admins` 
            SET `username` = ?, `password_hash` = ?, `role` = ? 
            WHERE `id` = ?
        ");

        $stmt->execute([
            $data['username'],
            $data['password_hash'],
            $data['role'],
            $id
        ]);
    }

    // Delete admin by ID
    public function deleteAdmin($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM `admins` WHERE `id` = ?");
        $stmt->execute([$id]);
    }
}
