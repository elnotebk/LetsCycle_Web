<?php

declare(strict_types=1);

namespace LetCycle;

/** Shared request and response helpers. */
final class Http
{
    private const MAXIMUM_BODY_SIZE = 8192;
    private const CONTENT_SECURITY_POLICY = "default-src 'self'; "
        . "script-src 'self' https://cdnjs.cloudflare.com; "
        . "style-src 'self' https://fonts.googleapis.com https://cdnjs.cloudflare.com; "
        . 'font-src https://fonts.gstatic.com; '
        . "img-src 'self' data: https://images.unsplash.com https://cdnjs.cloudflare.com https://*.tile.openstreetmap.org; "
        . "connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'";

    /** Sends the headers every response carries. */
    public static function sendSecurityHeaders(Config $config): void
    {
        header_remove('X-Powered-By');
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: DENY');
        header('Referrer-Policy: strict-origin-when-cross-origin');
        header('Content-Security-Policy: ' . self::CONTENT_SECURITY_POLICY);
        if ($config->production) {
            header('Strict-Transport-Security: max-age=31536000');
        }
    }

    /** Sends a JSON response using the shape the frontend expects. */
    public static function json(int $status, array $payload): void
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store');
        echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    }

    /** Reads a small JSON object body and rejects anything else. */
    public static function readJson(): object
    {
        if (!preg_match('~^application/json\b~i', $_SERVER['CONTENT_TYPE'] ?? '')) {
            throw new ApiError(415, 'Format data harus JSON.');
        }

        $body = (string) file_get_contents('php://input', false, null, 0, self::MAXIMUM_BODY_SIZE + 1);
        if (strlen($body) > self::MAXIMUM_BODY_SIZE) {
            throw new ApiError(413, 'Ukuran data terlalu besar.');
        }

        $input = json_decode($body, false, 16);
        if (!is_object($input)) {
            throw new ApiError(400, 'Format data tidak valid.');
        }
        return $input;
    }

    /** Identifies the client, using the proxy-appended address when configured. */
    public static function clientAddress(Config $config): string
    {
        if ($config->trustProxy) {
            $forwarded = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '');
            $last = trim((string) end($forwarded));
            if ($last !== '') {
                return $last;
            }
        }
        return $_SERVER['REMOTE_ADDR'] ?? '';
    }
}
