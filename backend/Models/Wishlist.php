<?php

declare(strict_types=1);

namespace LetCycle\Models;

/** The products an account has marked as favorites. */
final class Wishlist extends UserList
{
    /** @param int[] $productIds */
    private function __construct(int $userId, private array $productIds)
    {
        parent::__construct($userId);
    }

    public static function fromArray(array $record): static
    {
        return new self($record['userId'], $record['productIds']);
    }

    /** Adds or removes a product. */
    public function toggle(int $productId): void
    {
        if (in_array($productId, $this->productIds, true)) {
            $this->productIds = array_values(array_diff($this->productIds, [$productId]));
        } else {
            $this->productIds[] = $productId;
        }
    }

    public function toArray(): array
    {
        return ['userId' => $this->userId, 'productIds' => $this->productIds];
    }
}
