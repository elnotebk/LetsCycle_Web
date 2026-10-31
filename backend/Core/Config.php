<?php

declare(strict_types=1);

namespace LetCycle\Core;

/** Reads deployment settings from the environment; defaults suit local development. */
final class Config
{
    private const LOCAL_HOSTNAMES = ['localhost', '127.0.0.1', '[::1]'];

    /** @param string[] $allowedOrigins */
    private function __construct(
        public readonly string $dataDirectory,
        public readonly string $runtimeDirectory,
        public readonly bool $production,
        public readonly bool $trustProxy,
        public readonly array $allowedOrigins,
    ) {
    }

    /** Builds the configuration and refuses an unsafe production setup. */
    public static function fromEnvironment(): self
    {
        $production = getenv('APP_ENV') === 'production';
        $origins = array_filter(array_map('trim', explode(',', (string) getenv('ALLOWED_ORIGINS'))));
        $origins = array_values(array_map([self::class, 'normalizeOrigin'], $origins));
        if ($production && !$origins) {
            throw new \RuntimeException('ALLOWED_ORIGINS wajib diisi saat APP_ENV=production.');
        }

        // Files written while running go in a dot folder, which Live Server never watches,
        // so saving them cannot reload a page in the middle of a request.
        $root = dirname(__DIR__, 2);
        return new self("{$root}/data", "{$root}/.runtime", $production, getenv('TRUST_PROXY') === 'true', $origins);
    }

    /** Rejects Host headers outside the allowed sites to block DNS rebinding. */
    public function isAllowedHost(string $host): bool
    {
        $hostname = strtolower((string) parse_url("http://{$host}", PHP_URL_HOST));
        if (!$this->production && in_array($hostname, self::LOCAL_HOSTNAMES, true)) {
            return true;
        }
        foreach ($this->allowedOrigins as $origin) {
            if (parse_url($origin, PHP_URL_HOST) === $hostname) {
                return true;
            }
        }
        return false;
    }

    /** Reports whether an origin is configured or, in development, local HTTP. */
    public function isAllowedOrigin(string $origin): bool
    {
        if (in_array($origin, $this->allowedOrigins, true)) {
            return true;
        }
        return !$this->production
            && parse_url($origin, PHP_URL_SCHEME) === 'http'
            && in_array(parse_url($origin, PHP_URL_HOST), self::LOCAL_HOSTNAMES, true);
    }

    private static function normalizeOrigin(string $origin): string
    {
        $parts = parse_url($origin);
        if (!isset($parts['scheme'], $parts['host'])) {
            throw new \RuntimeException("ALLOWED_ORIGINS tidak valid: {$origin}");
        }
        $port = isset($parts['port']) ? ":{$parts['port']}" : '';
        return strtolower("{$parts['scheme']}://{$parts['host']}{$port}");
    }
}
