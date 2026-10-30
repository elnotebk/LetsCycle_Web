<?php

declare(strict_types=1);

namespace LetCycle;

/** Stores accounts as JSON lines, serializing access with a lock file. */
final class UserRepository
{
    private readonly string $file;

    public function __construct(private readonly string $dataDirectory)
    {
        $this->file = "{$dataDirectory}/users.txt";
    }

    /** Finds an account by its normalized email address. */
    public function findByEmail(string $email): ?array
    {
        return $this->find(static fn (array $user): bool => $user['email'] === $email);
    }

    /** Finds an account by id. */
    public function findById(int $id): ?array
    {
        return $this->find(static fn (array $user): bool => $user['id'] === $id);
    }

    /** Saves a new account, returning null when the email is already taken. */
    public function create(string $nama, string $email, string $passwordHash): ?array
    {
        return $this->withLock(LOCK_EX, function () use ($nama, $email, $passwordHash): ?array {
            $users = $this->readAll();
            foreach ($users as $user) {
                if ($user['email'] === $email) {
                    return null;
                }
            }

            $user = [
                'id' => max([0, ...array_column($users, 'id')]) + 1,
                'nama' => $nama,
                'email' => $email,
                'passwordHash' => $passwordHash,
                'dibuat' => gmdate('Y-m-d\TH:i:s\Z'),
            ];
            $line = json_encode($user, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
            file_put_contents($this->file, "{$line}\n", FILE_APPEND);
            return $user;
        });
    }

    private function find(callable $matches): ?array
    {
        return $this->withLock(LOCK_SH, function () use ($matches): ?array {
            foreach ($this->readAll() as $user) {
                if ($matches($user)) {
                    return $user;
                }
            }
            return null;
        });
    }

    private function readAll(): array
    {
        if (!is_file($this->file)) {
            return [];
        }
        $lines = file($this->file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        return array_map(static fn (string $line): array => json_decode($line, true, 16, JSON_THROW_ON_ERROR), $lines);
    }

    private function withLock(int $mode, callable $operation): mixed
    {
        if (!is_dir($this->dataDirectory)) {
            mkdir($this->dataDirectory, 0700, true);
        }

        $lock = fopen("{$this->file}.lock", 'c');
        if ($lock === false || !flock($lock, $mode)) {
            throw new \RuntimeException('Tidak dapat mengunci data pengguna.');
        }

        try {
            return $operation();
        } finally {
            flock($lock, LOCK_UN);
            fclose($lock);
        }
    }
}
