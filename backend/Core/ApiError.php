<?php

declare(strict_types=1);

namespace LetCycle\Core;

/** An error whose message is safe to return to the browser. */
final class ApiError extends \RuntimeException
{
    /** @param array<string, string> $headers */
    public function __construct(
        public readonly int $status,
        string $message,
        public readonly array $headers = [],
    ) {
        parent::__construct($message);
    }
}
