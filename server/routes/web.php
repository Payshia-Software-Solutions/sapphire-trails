<?php
require_once __DIR__ . '/../lib/Env.php';

// Load CORS settings
$allowedOriginsConfig = Env::get('ALLOWED_ORIGINS', 'http://localhost:3000,http://localhost:3001,http://sapphiretrails.lk,https://sapphiretrails.lk');
$allowedOrigins = array_map('trim', explode(',', $allowedOriginsConfig));

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (!empty($origin) && (in_array($origin, $allowedOrigins, true) || in_array('*', $allowedOrigins, true))) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
} else {
    // Default fallback
    header("Access-Control-Allow-Origin: *");
}

header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// Handle OPTIONS requests (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

ini_set('memory_limit', '256M');

// Environment-based error display configuration
$appEnv = Env::get('APP_ENV', 'development');
if ($appEnv === 'production') {
    error_reporting(E_ALL & ~E_DEPRECATED & ~E_STRICT);
    ini_set('display_errors', '0');
    ini_set('log_errors', '1');
} else {
    error_reporting(E_ALL);
    ini_set('display_errors', '1');
}

// Transaction Route files 
$userRoutes = require __DIR__ . '/userRoutes.php';
$adminRoutes = require __DIR__ . '/adminRoutes.php';
$tourRoutes = require __DIR__ . '/tourpackageRoutes.php';
$locationRoutes = require __DIR__ . '/locationRoutes.php';
$bookingRoutes = require __DIR__ . '/bookingRoutes.php';
$locationgalleryimageRoutes = require __DIR__ . '/locationgalleryimageRoutes.php';
$siteContentRoutes = require __DIR__ . '/sitecontentRoutes.php';
$tourexperiencegalleryRoutes = require __DIR__ . '/tourexperiencegalleryRoutes.php';
$contactRoutes = require __DIR__ . '/contactRoutes.php';
$icalRoutes = require __DIR__ . '/icalRoutes.php';
$mailRoutes = require __DIR__ . '/mailRoutes.php';
$invoiceRoutes = require __DIR__ . '/invoiceRoutes.php';
$analyticsRoutes = require __DIR__ . '/analyticsRoutes.php';

// Combine all routes
$routes = array_merge(
    $userRoutes,
    $adminRoutes,
    $tourRoutes,
    $locationRoutes,
    $bookingRoutes,
    $locationgalleryimageRoutes,
    $siteContentRoutes,
    $tourexperiencegalleryRoutes,
    $contactRoutes,
    $icalRoutes,
    $mailRoutes,
    $invoiceRoutes,
    $analyticsRoutes
);

// Define the home route
$routes['GET /'] = function () {
    if (file_exists(__DIR__ . '/../views/index.html')) {
        readfile(__DIR__ . '/../views/index.html');
    } else {
        echo json_encode(['status' => 'online', 'service' => 'Sapphire Trails API']);
    }
};

// Get request method and URI
$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Determine if the application is running in a local subdirectory
if ($_SERVER['HTTP_HOST'] === 'localhost' || strpos($_SERVER['HTTP_HOST'], 'localhost:') === 0) {
    $uri = str_replace(['/sapphire-trails/server', '/sapphire_trails_server'], '', $uri);
}

// Set the header for JSON responses, except for HTML pages and iCal export
if ($uri !== '/' && strpos($uri, '/ical/export') === false) {
    header('Content-Type: application/json');
}

$routeRegexPattern = "#\{[a-zA-Z0-9_]+\}#";

// Route matching
foreach ($routes as $route => $handler) {
    list($routeMethod, $routeUri) = explode(' ', $route, 2);
    $routeRegex = preg_replace($routeRegexPattern, '([a-zA-Z0-9_\-]+)', $routeUri);
    $routeRegex = "#^" . rtrim($routeRegex, '/') . "/?$#";

    if ($method === $routeMethod && preg_match($routeRegex, $uri, $matches)) {
        array_shift($matches); // Remove the full match
        call_user_func_array($handler, $matches);
        exit;
    }
}

// Default 404 response
http_response_code(404);
echo json_encode(['error' => 'Route not found']);
