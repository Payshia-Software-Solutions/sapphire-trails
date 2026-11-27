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
     * Resolve JWT signing secret safely (never allow weak fallback in production)
     */
    public static function getJwtSecret(): string
    {
        $secret = Env::get('APP_SECRET', '');
        $placeholder = 'generate_a_strong_64_character_random_secret_key_here';

        if (empty($secret) || $secret === $placeholder) {
            if (Env::get('APP_ENV', 'development') === 'production') {
                error_log('Security error: APP_SECRET is missing or using placeholder in production');
                http_response_code(500);
                header('Content-Type: application/json');
                echo json_encode(['error' => 'Server security configuration error']);
                exit;
            }
            return 'sapphire_trails_dev_only_secret_key';
        }

        return $secret;
    }

    /**
     * Generate a scoped HMAC resource access token (for booking/invoice links)
     */
    public static function generateResourceToken(string $scope, string $identifier): string
    {
        return hash_hmac('sha256', $scope . ':' . $identifier, self::getJwtSecret());
    }

    /**
     * Verify a scoped HMAC resource access token
     */
    public static function verifyResourceToken(string $scope, string $identifier, ?string $token): bool
    {
        if (empty($token) || !is_string($token)) {
            return false;
        }
        $expected = self::generateResourceToken($scope, $identifier);
        return hash_equals($expected, trim($token));
    }

    /**
     * Check whether an authenticated payload represents an admin user
     */
    public static function isAdmin(?array $user): bool
    {
        if (!$user) {
            return false;
        }
        $role = $user['role'] ?? ($user['type'] ?? '');
        return in_array($role, ['admin', 'superadmin'], true);
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

        $secret = self::getJwtSecret();
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
