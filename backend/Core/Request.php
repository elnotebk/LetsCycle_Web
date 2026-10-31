<?php

declare(strict_types=1);

namespace LetCycle\Core;

/** An immutable view of the current HTTP request. */
final class Request
{
    private const MAXIMUM_BODY_SIZE = 8192;

    /** @param array<string, mixed> $query */
    private function __construct(
        public readonly string $method,
        public readonly string $path,
        public readonly string $host,
        public readonly ?string $origin,
        public readonly array $query,
        private readonly string $contentType,
        private readonly string $remoteAddress,
        private readonly string $forwardedFor,
    ) {
    }

    /** Captures the request from PHP's superglobals. */
    public static function fromGlobals(): self
    {
        return new self(
            $_SERVER['REQUEST_METHOD'] ?? 'GET',
            (string) parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH),
            $_SERVER['HTTP_HOST'] ?? '',
            $_SERVER['HTTP_ORIGIN'] ?? null,
            $_GET,
            $_SERVER['CONTENT_TYPE'] ?? '',
            $_SERVER['REMOTE_ADDR'] ?? '',
            $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '',
        );
    }

    /** Returns a string query parameter, ignoring arrays and missing values. */
    public function queryText(string $name): string
    {
        $value = $this->query[$name] ?? null;
        return is_string($value) ? $value : '';
    }

    /** Reads a small JSON object body and rejects anything else. */
    public function json(): object
    {
        if (!preg_match('~^application/json\b~i', $this->contentType)) {
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
    public function clientAddress(Config $config): string
    {
        if ($config->trustProxy) {
            $forwarded = explode(',', $this->forwardedFor);
            $last = trim((string) end($forwarded));
            if ($last !== '') {
                return $last;
            }
        }
        return $this->remoteAddress;
    }
}
