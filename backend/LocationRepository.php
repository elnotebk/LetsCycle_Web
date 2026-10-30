<?php

declare(strict_types=1);

namespace LetCycle;

/** Reads and searches the JSON-lines location store. */
final class LocationRepository
{
    private readonly string $file;

    public function __construct(string $dataDirectory)
    {
        $this->file = "{$dataDirectory}/locations.txt";
    }

    /** Searches location names and addresses, optionally narrowed to a city. */
    public function search(string $query, string $city): array
    {
        $query = mb_strtolower(trim($query));
        $city = mb_strtolower(trim($city));

        return array_values(array_filter($this->findAll(), static function (array $location) use ($query, $city): bool {
            $text = mb_strtolower("{$location['nama']} {$location['alamat']}");
            return ($query === '' || str_contains($text, $query))
                && ($city === '' || mb_strtolower($location['kota']) === $city);
        }));
    }

    /** Returns the distinct saved cities in alphabetical order. */
    public function listCities(): array
    {
        $cities = array_values(array_unique(array_column($this->findAll(), 'kota')));
        sort($cities, SORT_STRING | SORT_FLAG_CASE);
        return $cities;
    }

    private function findAll(): array
    {
        if (!is_file($this->file)) {
            return [];
        }
        $lines = file($this->file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        return array_map(static fn (string $line): array => json_decode($line, true, 16, JSON_THROW_ON_ERROR), $lines);
    }
}
