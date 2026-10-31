<?php

declare(strict_types=1);

namespace LetCycle\Repositories;

use LetCycle\Models\Location;

/** Location storage, independent of where locations are kept. */
interface LocationRepositoryInterface
{
    /**
     * Searches location names and addresses, optionally narrowed to a city.
     *
     * @return Location[]
     */
    public function search(string $query, string $city): array;

    /**
     * Returns the distinct saved cities in alphabetical order.
     *
     * @return string[]
     */
    public function listCities(): array;
}
