<?php
// Report all PHP errors and display them for development
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set CORS headers for every response
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, Accept, X-Requested-With");

// Handle pre-flight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once './config/database.php';
require_once './lib/router.php'; 

// Establish database connection and make it globally available
$database = new Database();
$GLOBALS['pdo'] = $database->getConnection();

// Determine the request path, removing the base directory if necessary
$request_uri = $_SERVER['REQUEST_URI'];
$base_path = '/sapphire_trails_server';
$route_path = str_replace($base_path, '', $request_uri);
$route_path = parse_url($route_path, PHP_URL_PATH); // Strip query parameters
$route_path = rtrim($route_path, '/'); // Remove trailing slash
if (empty($route_path)) {
    $route_path = '/';
}


$router = new Router();

// Modular route inclusion
$router->group('/users', require_once './routes/userRoutes.php');
$router->group('/tours', require_once './routes/tourpackageRoutes.php');
$router->group('/bookings', require_once './routes/bookingRoutes.php');
$router->group('/content', require_once './routes/sitecontentRoutes.php');

// Special case for login which is not under a group
$router->post('/login', function() {
    require_once './controllers/UserController.php';
    $controller = new UserController($GLOBALS['pdo']);
    $controller->login();
});

// Home route
$router->get('/', function() {
    header('Content-Type: text/html');
    if (file_exists('./views/index.html')) {
        readfile('./views/index.html');
    } else {
        header('Content-Type: application/json');
        echo json_encode(['message' => 'Welcome to the Sapphire Trails API']);
    }
});

// Dispatch the request to the appropriate handler
$router->dispatch($route_path);
?>