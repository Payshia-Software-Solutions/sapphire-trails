<?php
require_once __DIR__ . '/Env.php';

function applyCorsHeaders(): void
{
    $appEnv = Env::get('APP_ENV', 'development');
    $allowedOriginsConfig = Env::get(
        'ALLOWED_ORIGINS',
        'http://localhost:3000,http://localhost:3001,http://sapphiretrails.lk,https://sapphiretrails.lk,http://www.sapphiretrails.lk,https://www.sapphiretrails.lk,http://192.168.8.115'
    );
    $allowedOrigins = array_map('trim', explode(',', $allowedOriginsConfig));

    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $isLocalOrigin = preg_match('#^https?://(192\.168\.\d+\.\d+|127\.0\.0\.1|10\.\d+\.\d+\.\d+|localhost)(:\d+)?$#i', $origin);
    $isAllowedOrigin = !empty($origin) && (
        in_array($origin, $allowedOrigins, true) ||
        preg_match('#^https?://(www\.)?sapphiretrails\.lk$#i', $origin) ||
        ($appEnv !== 'production' && $isLocalOrigin)
    );

    if ($isAllowedOrigin) {
        header("Access-Control-Allow-Origin: $origin");
        header("Access-Control-Allow-Credentials: true");
    } elseif ($appEnv !== 'production') {
        header("Access-Control-Allow-Origin: *");
    }

    header("Vary: Origin");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin");
    header("Access-Control-Max-Age: 86400");

    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        http_response_code(204);
        exit();
    }
}
