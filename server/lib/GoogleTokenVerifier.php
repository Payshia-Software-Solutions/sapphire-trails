<?php
require_once __DIR__ . '/Env.php';

class GoogleTokenVerifier
{
    private const GOOGLE_TOKENINFO_URL = 'https://oauth2.googleapis.com/tokeninfo';
    private const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';

    /**
     * Verify a Google OAuth2 access_token or ID token directly via Google endpoints.
     * Returns ['email' => ..., 'name' => ..., 'picture' => ..., 'sub' => ...] or throws Exception.
     */
    public static function verify(?string $accessToken = null, ?string $idToken = null): array
    {
        if (!empty($accessToken)) {
            return self::verifyAccessToken($accessToken);
        }
        if (!empty($idToken)) {
            return self::verifyIdToken($idToken);
        }
        throw new Exception('Google authentication token is required.');
    }

    private static function verifyAccessToken(string $accessToken): array
    {
        $rawInfo = self::httpGet(self::GOOGLE_TOKENINFO_URL . '?access_token=' . urlencode($accessToken));
        if (!$rawInfo) {
            throw new Exception('Failed to verify Google access token.');
        }

        $tokenInfo = json_decode($rawInfo, true);
        if (!is_array($tokenInfo) || !empty($tokenInfo['error']) || !empty($tokenInfo['error_description'])) {
            throw new Exception('Invalid or expired Google access token.');
        }

        $googleClientId = trim((string)Env::get('GOOGLE_CLIENT_ID', ''));
        $tokenAud = (string)($tokenInfo['aud'] ?? ($tokenInfo['azp'] ?? ''));
        if ($googleClientId !== '' && $tokenAud !== $googleClientId) {
            throw new Exception('Google token client ID mismatch.');
        }

        if (isset($tokenInfo['expires_in']) && (int)$tokenInfo['expires_in'] <= 0) {
            throw new Exception('Google access token has expired.');
        }

        // Fetch verified profile details (name, email, picture)
        $rawUser = self::httpGet(self::GOOGLE_USERINFO_URL, [
            'Authorization: Bearer ' . $accessToken,
        ]);
        $userInfo = $rawUser ? json_decode($rawUser, true) : null;

        if (!is_array($userInfo)) {
            $userInfo = $tokenInfo;
        }

        $email = trim((string)($userInfo['email'] ?? ($tokenInfo['email'] ?? '')));
        $emailVerifiedRaw = $userInfo['email_verified'] ?? ($tokenInfo['email_verified'] ?? false);
        $emailVerified = $emailVerifiedRaw === true || $emailVerifiedRaw === 'true' || $emailVerifiedRaw === '1' || $emailVerifiedRaw === 1;

        if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || !$emailVerified) {
            throw new Exception('A verified Google email address is required.');
        }

        $name = trim((string)($userInfo['name'] ?? ''));
        if ($name === '') {
            $name = explode('@', $email)[0];
        }

        return [
            'email' => $email,
            'name' => $name,
            'picture' => $userInfo['picture'] ?? null,
            'sub' => (string)($userInfo['sub'] ?? ($tokenInfo['sub'] ?? '')),
        ];
    }

    private static function verifyIdToken(string $idToken): array
    {
        $raw = self::httpGet(self::GOOGLE_TOKENINFO_URL . '?id_token=' . urlencode($idToken));
        if (!$raw) {
            throw new Exception('Failed to verify Google ID token.');
        }

        $info = json_decode($raw, true);
        if (!is_array($info) || !empty($info['error'])) {
            throw new Exception('Google ID token verification rejected.');
        }

        $googleClientId = trim((string)Env::get('GOOGLE_CLIENT_ID', ''));
        if ($googleClientId !== '' && ($info['aud'] ?? '') !== $googleClientId) {
            throw new Exception('Google token client ID mismatch.');
        }

        $emailVerified = ($info['email_verified'] ?? '') === 'true' || ($info['email_verified'] ?? false) === true;
        $email = trim((string)($info['email'] ?? ''));
        if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || !$emailVerified) {
            throw new Exception('A verified Google email address is required.');
        }

        $name = trim((string)($info['name'] ?? ''));
        if ($name === '') {
            $name = explode('@', $email)[0];
        }

        return [
            'email' => $email,
            'name' => $name,
            'picture' => $info['picture'] ?? null,
            'sub' => (string)($info['sub'] ?? ''),
        ];
    }

    private static function httpGet(string $url, array $headers = []): ?string
    {
        if (function_exists('curl_init')) {
            $ch = curl_init($url);
            $opts = [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT => 10,
                CURLOPT_SSL_VERIFYPEER => true,
            ];
            if (!empty($headers)) {
                $opts[CURLOPT_HTTPHEADER] = $headers;
            }
            curl_setopt_array($ch, $opts);
            $res = curl_exec($ch);
            $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            return ($res !== false && $code >= 200 && $code < 300) ? $res : null;
        }

        $headerStr = !empty($headers) ? implode("\r\n", $headers) . "\r\n" : '';
        $ctx = stream_context_create([
            'http' => [
                'timeout' => 10,
                'header' => $headerStr,
            ],
        ]);
        $res = @file_get_contents($url, false, $ctx);
        return $res !== false ? $res : null;
    }
}
