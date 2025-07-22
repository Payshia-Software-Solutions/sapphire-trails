<?php
// Set CORS headers for every response
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle OPTIONS requests (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

ini_set('memory_limit', '256M');
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once './lib/router.php';

// Route files
$routesConfig = [
    '/users' => './routes/userRoutes.php',
    '/admin' => './routes/adminRoutes.php',
    '/tours' => './routes/tourpackageRoutes.php',
    '/locations' => './routes/locationRoutes.php',
    '/bookings' => './routes/bookingRoutes.php',
    '/location-gallery' => './routes/locationgalleryimageRoutes.php',
    '/site-content' => './routes/sitecontentRoutes.php',
    '/experience-gallery' => './routes/tourexperiencegalleryRoutes.php',
];

$router = new Router();
foreach ($routesConfig as $prefix => $file) {
    if (file_exists($file)) {
        $routeDefinition = require $file;
        if (is_callable($routeDefinition)) {
            $router->group($prefix, $routeDefinition);
        }
    }
}

// Get request method and URI
$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Adjust URI if running in a subdirectory
if (isset($_SERVER['CONTEXT_PREFIX']) && strpos($uri, $_SERVER['CONTEXT_PREFIX']) === 0) {
    $uri = substr($uri, strlen($_SERVER['CONTEXT_PREFIX']));
} elseif (strpos($uri, '/sapphire_trails_server') === 0) { // Fallback for localhost
    $uri = str_replace('/sapphire_trails_server', '', $uri);
}
$uri = $uri ?: '/';

header('Content-Type: application/json');

// Dispatch the request
$router->dispatch($uri);
?>