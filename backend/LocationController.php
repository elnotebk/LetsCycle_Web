<?php

declare(strict_types=1);

namespace LetCycle;

/** Handles JSON responses for the public location endpoints. */
final class LocationController
{
    public function __construct(private readonly LocationRepository $repository)
    {
    }

    /** Returns locations filtered by the optional query and city parameters. */
    public function list(): void
    {
        $query = is_string($_GET['q'] ?? null) ? $_GET['q'] : '';
        $city = is_string($_GET['kota'] ?? null) ? $_GET['kota'] : '';
        Http::json(200, ['ok' => true, 'locations' => $this->repository->search($query, $city)]);
    }

    /** Returns cities available in the location store. */
    public function listCities(): void
    {
        Http::json(200, ['ok' => true, 'cities' => $this->repository->listCities()]);
    }
}
