<?php
require_once __DIR__ . '/../lib/Env.php';
require_once __DIR__ . '/../lib/Cors.php';

if (!headers_sent()) {
    applyCorsHeaders();
}

$appEnv = Env::get('APP_ENV', 'development');

ini_set('memory_limit', '256M');

// Environment-based error display configuration
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
$articleRoutes = require __DIR__ . '/articleRoutes.php';
$subscriberRoutes = require __DIR__ . '/subscriberRoutes.php';
$referralRoutes = require __DIR__ . '/referralRoutes.php';
$systemRoutes = require __DIR__ . '/systemRoutes.php';

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
    $analyticsRoutes,
    $articleRoutes,
    $subscriberRoutes,
    $referralRoutes,
    $systemRoutes
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

// Determine if the application is running in a local subdirectory or accessed via local IP
$host = $_SERVER['HTTP_HOST'] ?? '';
$isLocal = (
    $host === 'localhost' ||
    strpos($host, 'localhost:') === 0 ||
    strpos($host, '127.0.0.1') === 0 ||
    strpos($host, '192.168.') === 0 ||
    strpos($host, '10.') === 0 ||
    preg_match('/^172\.(1[6-9]|2[0-9]|3[0-1])\./', $host)
);

if ($isLocal || strpos($uri, '/sapphire-trails/server') !== false || strpos($uri, '/sapphire_trails_server') !== false) {
    $uri = str_replace(['/sapphire-trails/server', '/sapphire_trails_server'], '', $uri);
}
if (empty($uri)) {
    $uri = '/';
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
