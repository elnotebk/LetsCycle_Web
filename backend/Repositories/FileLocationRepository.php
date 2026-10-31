<?php

declare(strict_types=1);

namespace LetCycle\Repositories;

use LetCycle\Models\Location;

/** Reads and searches the JSON-lines location store. */
final class FileLocationRepository extends JsonLinesRepository implements LocationRepositoryInterface
{
    public function __construct(string $dataDirectory)
    {
        parent::__construct($dataDirectory, 'locations.txt');
    }

    public function search(string $query, string $city): array
    {
        return array_values(array_filter(
            $this->readAll(),
            static fn (Location $location): bool => $location->matches($query, $city),
        ));
    }

    public function listCities(): array
    {
        $names = array_map(static fn (Location $location): string => $location->kota, $this->readAll());
        $cities = array_values(array_unique($names));
        sort($cities, SORT_STRING | SORT_FLAG_CASE);
        return $cities;
    }

    protected function toModel(array $record): Location
    {
        return Location::fromArray($record);
    }
}
