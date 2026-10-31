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
            file_put_contents($this->file, $this->toLine($user), FILE_APPEND);
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
}
