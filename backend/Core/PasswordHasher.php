<?php

declare(strict_types=1);

namespace LetCycle\Core;

/** Creates and verifies salted password hashes. */
final class PasswordHasher
{
    private readonly string|int $algorithm;

    public function __construct()
    {
        $this->algorithm = defined('PASSWORD_ARGON2ID') ? PASSWORD_ARGON2ID : PASSWORD_DEFAULT;
    }

    /** Hashes a password for storage. */
    public function hash(string $password): string
    {
        return password_hash($password, $this->algorithm);
    }

    /** Hashes anyway when there is nothing to verify, so timing hides whether an email exists. */
    public function verify(string $password, ?string $hash): bool
    {
        if ($hash === null || password_get_info($hash)['algo'] === null) {
            $this->hash($password);
            return false;
        }
        return password_verify($password, $hash);
    }
}
