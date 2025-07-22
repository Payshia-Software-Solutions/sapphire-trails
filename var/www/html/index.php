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

// Report all PHP errors
error_reporting(E_ALL);

// Display errors in the browser (for development)
ini_set('display_errors', 1);

require_once './config/database.php';
require_once './lib/router.php';

$database = new Database();
$GLOBALS['pdo'] = $database->getConnection();

// Route files
$routesConfig = [
    '/users' => './routes/userRoutes.php',
    '/tours' => './routes/tourpackageRoutes.php',
    '/locations' => './routes/locationRoutes.php',
    '/bookings' => './routes/bookingRoutes.php',
    '/location-gallery' => './routes/locationgalleryimageRoutes.php',
    '/content' => './routes/sitecontentRoutes.php',
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
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);  // Get only the path, not query parameters

// Determine if the application is running on localhost
if ($_SERVER['HTTP_HOST'] === 'localhost') {
    // Adjust URI if needed (only on localhost)
    $uri = str_replace('/sapphire_trails_server', '', $uri);
}

// Ensure the URI is not empty after potential modifications
$uri = $uri ?: '/';


// Set the header for JSON responses, except for HTML pages
if (strpos($uri, '/views/') === false) { // A simple check to avoid setting JSON for HTML views.
    header('Content-Type: application/json');
}

// Dispatch the request
try {
    $router->dispatch($uri);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}

?>
