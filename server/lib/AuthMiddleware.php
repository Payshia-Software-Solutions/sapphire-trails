<?php
require_once __DIR__ . '/JWT.php';
require_once __DIR__ . '/Env.php';

class AuthMiddleware
{
    private static $currentUser = null;

    /**
     * Get bearer token from request headers
     */
    public static function getBearerToken(): ?string
    {
        $headers = null;
        if (isset($_SERVER['Authorization'])) {
            $headers = trim($_SERVER['Authorization']);
        } elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $headers = trim($_SERVER['HTTP_AUTHORIZATION']);
        } elseif (function_exists('apache_request_headers')) {
            $requestHeaders = apache_request_headers();
            $requestHeaders = array_combine(array_map('ucwords', array_keys($requestHeaders)), array_values($requestHeaders));
            if (isset($requestHeaders['Authorization'])) {
                $headers = trim($requestHeaders['Authorization']);
            }
        }

        if (!empty($headers)) {
            if (preg_match('/Bearer\s(\S+)/i', $headers, $matches)) {
                return $matches[1];
            }
        }

        return null;
    }

    /**
     * Authenticate token and return payload, or null if invalid
     */
    public static function authenticate(): ?array
    {
        $token = self::getBearerToken();
        if (!$token) {
            return null;
        }

        $secret = Env::get('APP_SECRET', 'sapphire_trails_default_fallback_secret_key');
        $payload = JWT::decode($token, $secret);

        if ($payload) {
            self::$currentUser = $payload;
            return $payload;
        }

        return null;
    }

    /**
     * Require any authenticated user (client or admin)
     */
    public static function requireAuth(): array
    {
        $user = self::authenticate();
        if (!$user) {
            http_response_code(401);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Unauthorized: Invalid or missing authorization token']);
            exit;
        }
        return $user;
    }

    /**
     * Require an administrator (role 'admin' or 'superadmin')
     */
    public static function requireAdmin(): array
    {
        $user = self::requireAuth();

        $role = $user['role'] ?? ($user['type'] ?? '');
        if (!in_array($role, ['admin', 'superadmin'])) {
            http_response_code(403);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Forbidden: Administrative privileges required']);
            exit;
        }

        return $user;
    }

    /**
     * Get the authenticated user payload if available
     */
    public static function getCurrentUser(): ?array
    {
        return self::$currentUser;
    }
}
