<?php

declare(strict_types=1);

namespace LetCycle\Models;

/** A registered account and the rules for its details. */
final class User extends Model
{
    private function __construct(
        public readonly int $id,
        public readonly string $nama,
        public readonly string $email,
        public readonly string $passwordHash,
        public readonly string $dibuat,
    ) {
    }

    /** Creates a new account dated now. */
    public static function create(int $id, string $nama, string $email, string $passwordHash): self
    {
        return new self($id, $nama, $email, $passwordHash, gmdate('Y-m-d\TH:i:s\Z'));
    }

    public static function fromArray(array $record): static
    {
        return new self($record['id'], $record['nama'], $record['email'], $record['passwordHash'], $record['dibuat']);
    }

    /** Puts an email address in the form accounts are stored under. */
    public static function normalizeEmail(string $email): string
    {
        return mb_strtolower(trim($email));
    }

    /** Reports whether normalized details are acceptable for a new account. */
    public static function isValidRegistration(string $nama, string $email, string $password): bool
    {
        return mb_strlen($nama) >= 2 && mb_strlen($nama) <= 60
            && mb_strlen($email) <= 254 && preg_match('/^[^\s@]+@[^\s@]+\.[^\s@]+$/u', $email) === 1
            && mb_strlen($password) >= 8 && mb_strlen($password) <= 128;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'nama' => $this->nama,
            'email' => $this->email,
            'passwordHash' => $this->passwordHash,
            'dibuat' => $this->dibuat,
        ];
    }

    /** Leaves the password hash out of anything sent to clients. */
    public function jsonSerialize(): array
    {
        $public = $this->toArray();
        unset($public['passwordHash']);
        return $public;
    }
}
