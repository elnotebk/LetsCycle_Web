<?php

declare(strict_types=1);

namespace LetCycle\Models;

/** A recycling drop-off point. */
final class Location extends Model
{
    private function __construct(
        public readonly int $id,
        public readonly string $nama,
        public readonly string $alamat,
        public readonly string $telepon,
        public readonly string $kota,
        public readonly float $lat,
        public readonly float $lng,
    ) {
    }

    public static function fromArray(array $record): static
    {
        return new self(
            $record['id'],
            $record['nama'],
            $record['alamat'],
            $record['telepon'],
            $record['kota'],
            (float) $record['lat'],
            (float) $record['lng'],
        );
    }

    /** Reports whether the name or address contains the query, within the city if given. */
    public function matches(string $query, string $city): bool
    {
        $query = mb_strtolower(trim($query));
        $city = mb_strtolower(trim($city));
        $text = mb_strtolower("{$this->nama} {$this->alamat}");

        return ($query === '' || str_contains($text, $query))
            && ($city === '' || mb_strtolower($this->kota) === $city);
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'nama' => $this->nama,
            'alamat' => $this->alamat,
            'telepon' => $this->telepon,
            'kota' => $this->kota,
            'lat' => $this->lat,
            'lng' => $this->lng,
        ];
    }
}
