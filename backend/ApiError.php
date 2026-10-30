<?php

declare(strict_types=1);

namespace LetCycle;

/** An error whose message is safe to return to the browser. */
final class ApiError extends \RuntimeException
{
    public function __construct(public readonly int $status, string $message)
    {
        parent::__construct($message);
    }
}
