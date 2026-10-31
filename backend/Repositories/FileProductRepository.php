<?php

declare(strict_types=1);

namespace LetCycle\Repositories;

use LetCycle\Models\Product;

/** Reads the JSON-lines product store. */
final class FileProductRepository extends JsonLinesRepository implements ProductRepositoryInterface
{
    public function __construct(string $dataDirectory)
    {
        parent::__construct($dataDirectory, 'products.txt');
    }

    public function findAll(): array
    {
        return $this->readAll();
    }

    public function findById(int $id): ?Product
    {
        foreach ($this->readAll() as $product) {
            if ($product->id === $id) {
                return $product;
            }
        }
        return null;
    }

    protected function toModel(array $record): Product
    {
        return Product::fromArray($record);
    }
}
