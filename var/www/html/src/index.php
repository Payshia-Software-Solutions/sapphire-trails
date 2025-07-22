<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once './config/database.php';
require_once './lib/router.php';

$database = new Database();
$GLOBALS['pdo'] = $database->getConnection();

$request_uri = $_SERVER['REQUEST_URI'];
$base_path = '/sapphire_trails_server'; // Adjust if your app is in a subdirectory on the server
$route_path = str_replace($base_path, '', $request_uri);
$route_path = parse_url($route_path, PHP_URL_PATH);

$router = new Router();

// Modular route inclusion
$router->group('/users', require_once './routes/userRoutes.php');
$router->group('/bookings', require_once './routes/bookingRoutes.php');
$router->group('/tours', require_once './routes/tourpackageRoutes.php');
$router->group('/locations', require_once './routes/locationRoutes.php');
$router->group('/content', require_once './routes/sitecontentRoutes.php');
$router->group('/experience-gallery', require_once './routes/experiencegalleryRoutes.php');


// The login route is now handled within userRoutes.php, so the special case is removed.


$router->dispatch($route_path);

?>
