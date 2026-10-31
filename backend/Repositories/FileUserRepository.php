<?php

declare(strict_types=1);

namespace LetCycle\Repositories;

use LetCycle\Models\User;

/** Stores accounts as JSON lines, serializing access with a lock file. */
final class FileUserRepository extends JsonLinesRepository implements UserRepositoryInterface
{
    public function __construct(string $dataDirectory)
    {
        parent::__construct($dataDirectory, 'users.txt');
    }

    public function findByEmail(string $email): ?User
    {
        return $this->find(static fn (User $user): bool => $user->email === $email);
    }

    public function findById(int $id): ?User
    {
        return $this->find(static fn (User $user): bool => $user->id === $id);
    }

    public function create(string $nama, string $email, string $passwordHash): ?User
    {
        return $this->withLock(LOCK_EX, function () use ($nama, $email, $passwordHash): ?User {
            $users = $this->readAll();
            foreach ($users as $user) {
                if ($user->email === $email) {
                    return null;
                }
            }

            $ids = array_map(static fn (User $user): int => $user->id, $users);
            $user = User::create(max([0, ...$ids]) + 1, $nama, $email, $passwordHash);
            $line = json_encode($user->toArray(), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
            file_put_contents($this->file, "{$line}\n", FILE_APPEND);
            return $user;
        });
    }

    protected function toModel(array $record): User
    {
        return User::fromArray($record);
    }

    private function find(callable $matches): ?User
    {
        return $this->withLock(LOCK_SH, function () use ($matches): ?User {
            foreach ($this->readAll() as $user) {
                if ($matches($user)) {
                    return $user;
                }
            }
            return null;
        });
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
