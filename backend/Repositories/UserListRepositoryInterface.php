<?php

declare(strict_types=1);

namespace LetCycle\Repositories;

use LetCycle\Models\UserList;

/** Storage for per-account collections such as carts and wishlists. */
interface UserListRepositoryInterface
{
    /** Returns the account's collection, empty if nothing is saved yet. */
    public function findByUser(int $userId): UserList;

    /** Applies a change and saves it as one step, so concurrent changes are not lost. */
    public function update(int $userId, callable $change): UserList;
}
