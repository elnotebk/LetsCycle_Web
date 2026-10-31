<?php

declare(strict_types=1);

namespace LetCycle\Models;

/** The products an account intends to buy, with their quantities. */
final class Cart extends UserList
{
    private const MAXIMUM_QUANTITY = 99;

    /** @param array<int, int> $quantities Quantities keyed by product id. */
    private function __construct(int $userId, private array $quantities)
    {
        parent::__construct($userId);
    }

    public static function fromArray(array $record): static
    {
        return new self($record['userId'], array_column($record['items'], 'quantity', 'productId'));
    }

    /** Adds one unit, returning false when the product is at its limit. */
    public function add(int $productId): bool
    {
        $quantity = $this->quantities[$productId] ?? 0;
        if ($quantity >= self::MAXIMUM_QUANTITY) {
            return false;
        }
        $this->quantities[$productId] = $quantity + 1;
        return true;
    }

    /** Removes a product entirely. */
    public function remove(int $productId): void
    {
        unset($this->quantities[$productId]);
    }

    public function toArray(): array
    {
        $items = [];
        foreach ($this->quantities as $productId => $quantity) {
            $items[] = ['productId' => $productId, 'quantity' => $quantity];
        }
        return ['userId' => $this->userId, 'items' => $items];
    }
}
