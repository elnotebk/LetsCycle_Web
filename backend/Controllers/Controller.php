<?php

declare(strict_types=1);

namespace LetCycle\Controllers;

use LetCycle\Core\Request;
use LetCycle\Views\JsonView;

/** Gives controllers the current request and a way to respond. */
abstract class Controller
{
    public function __construct(
        protected readonly Request $request,
        protected readonly JsonView $view,
    ) {
    }
}
