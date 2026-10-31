<?php

declare(strict_types=1);

namespace LetCycle\Repositories;

use LetCycle\Models\Cart;

/** Stores carts in the JSON-lines cart file. */
final class FileCartRepository extends FileUserListRepository
{
    public function __construct(string $dataDirectory)
    {
        parent::__construct($dataDirectory, 'carts.txt');
    }

    protected function toModel(array $record): Cart
    {
        return Cart::fromArray($record);
    }

    protected function createEmpty(int $userId): Cart
    {
        return Cart::fromArray(['userId' => $userId, 'items' => []]);
    }
}
