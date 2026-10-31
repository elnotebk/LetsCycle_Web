<?php

declare(strict_types=1);

namespace LetCycle\Models;

/** A domain record that can be restored from storage and rendered as JSON. */
abstract class Model implements \JsonSerializable
{
    /** Restores a model from its stored fields. */
    abstract public static function fromArray(array $record): static;

    /** Returns every field for storage. */
    abstract public function toArray(): array;

    /** Returns the fields clients may see; every stored field unless overridden. */
    public function jsonSerialize(): array
    {
        return $this->toArray();
    }
}
