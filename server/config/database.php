<?php
require_once __DIR__ . '/../lib/Env.php';

$host    = Env::get('DB_HOST', 'localhost');
$db      = Env::get('DB_NAME', 'sapphire_trails');
$user    = Env::get('DB_USER', 'root');
$pass    = Env::get('DB_PASS', '');
$charset = Env::get('DB_CHARSET', 'utf8mb4');

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    error_log("Database connection error: " . $e->getMessage());
    http_response_code(500);
    header('Content-Type: application/json');
    if (Env::get('APP_ENV') === 'development') {
        echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    } else {
        echo json_encode(['error' => 'Database connection failed. Please try again later.']);
    }
    exit;
}
