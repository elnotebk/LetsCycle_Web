<?php

declare(strict_types=1);

namespace LetCycle\Models;

/** A saved collection of products belonging to one account. */
abstract class UserList extends Model
{
    protected function __construct(public readonly int $userId)
    {
    }

    /** Returns the collection's contents without the owner's id. */
    public function jsonSerialize(): array
    {
        $public = $this->toArray();
        unset($public['userId']);
        return $public;
    }
}
