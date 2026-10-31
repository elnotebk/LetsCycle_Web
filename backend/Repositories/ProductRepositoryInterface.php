<?php

declare(strict_types=1);

namespace LetCycle\Repositories;

use LetCycle\Models\Product;

/** Product storage, independent of where products are kept. */
interface ProductRepositoryInterface
{
    /** @return Product[] */
    public function findAll(): array;

    /** Finds a product by id. */
    public function findById(int $id): ?Product;
}
