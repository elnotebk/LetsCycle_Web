<?php

declare(strict_types=1);

namespace LetCycle\Core;

/** Sends the headers every response carries. */
final class SecurityHeaders
{
    private const CONTENT_SECURITY_POLICY = "default-src 'self'; "
        . "script-src 'self' https://cdnjs.cloudflare.com; "
        . "style-src 'self' https://fonts.googleapis.com https://cdnjs.cloudflare.com; "
        . 'font-src https://fonts.gstatic.com; '
        . "img-src 'self' data: https://images.unsplash.com https://cdnjs.cloudflare.com https://*.tile.openstreetmap.org; "
        . "connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'";

    public function __construct(private readonly Config $config)
    {
    }

    /** Writes the headers to the current response. */
    public function send(): void
    {
        header_remove('X-Powered-By');
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: DENY');
        header('Referrer-Policy: strict-origin-when-cross-origin');
        header('Content-Security-Policy: ' . self::CONTENT_SECURITY_POLICY);
        if ($this->config->production) {
            header('Strict-Transport-Security: max-age=31536000');
        }
    }
}
