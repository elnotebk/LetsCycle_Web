<?php

declare(strict_types=1);

namespace LetCycle\Models;

/** A recycled product sold in the marketplace. */
final class Product extends Model
{
    private function __construct(
        public readonly int $id,
        public readonly string $nama,
        public readonly string $kataKunci,
        public readonly string $kategori,
        public readonly int $harga,
        public readonly string $label,
        public readonly float $rating,
        public readonly int $ulasan,
        public readonly string $gambar,
        public readonly string $gambarAlt,
    ) {
    }

    public static function fromArray(array $record): static
    {
        return new self(
            $record['id'],
            $record['nama'],
            $record['kataKunci'],
            $record['kategori'],
            $record['harga'],
            $record['label'],
            (float) $record['rating'],
            $record['ulasan'],
            $record['gambar'],
            $record['gambarAlt'],
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'nama' => $this->nama,
            'kataKunci' => $this->kataKunci,
            'kategori' => $this->kategori,
            'harga' => $this->harga,
            'label' => $this->label,
            'rating' => $this->rating,
            'ulasan' => $this->ulasan,
            'gambar' => $this->gambar,
            'gambarAlt' => $this->gambarAlt,
        ];
    }
}
