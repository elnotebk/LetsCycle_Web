<?php

declare(strict_types=1);

namespace LetCycle\Repositories;

use LetCycle\Models\Wishlist;

/** Stores wishlists in the JSON-lines wishlist file. */
final class FileWishlistRepository extends FileUserListRepository
{
    public function __construct(string $dataDirectory)
    {
        parent::__construct($dataDirectory, 'wishlists.txt');
    }

    protected function toModel(array $record): Wishlist
    {
        return Wishlist::fromArray($record);
    }

    protected function createEmpty(int $userId): Wishlist
    {
        return Wishlist::fromArray(['userId' => $userId, 'productIds' => []]);
    }
}
