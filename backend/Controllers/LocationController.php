<?php

declare(strict_types=1);

namespace LetCycle\Controllers;

use LetCycle\Core\Request;
use LetCycle\Repositories\LocationRepositoryInterface;
use LetCycle\Views\JsonView;

/** Handles the public location endpoints. */
final class LocationController extends Controller
{
    public function __construct(
        Request $request,
        JsonView $view,
        private readonly LocationRepositoryInterface $locations,
    ) {
        parent::__construct($request, $view);
    }

    /** Returns locations filtered by the optional query and city parameters. */
    public function list(): void
    {
        $locations = $this->locations->search($this->request->queryText('q'), $this->request->queryText('kota'));
        $this->view->success(200, ['locations' => $locations]);
    }

    /** Returns cities available in the location store. */
    public function listCities(): void
    {
        $this->view->success(200, ['cities' => $this->locations->listCities()]);
    }
}
