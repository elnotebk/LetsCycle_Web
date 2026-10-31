<?php

declare(strict_types=1);

namespace LetCycle\Repositories;

use LetCycle\Models\User;

/** Account storage, independent of where accounts are kept. */
interface UserRepositoryInterface
{
    /** Finds an account by its normalized email address. */
    public function findByEmail(string $email): ?User;

    /** Finds an account by id. */
    public function findById(int $id): ?User;

    /** Saves a new account, returning null when the email is already taken. */
    public function create(string $nama, string $email, string $passwordHash): ?User;
}
