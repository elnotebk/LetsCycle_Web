<?php

declare(strict_types=1);

namespace LetCycle\Controllers;

use LetCycle\Core\Request;
use LetCycle\Repositories\ProductRepositoryInterface;
use LetCycle\Views\JsonView;

/** Handles the public product catalog endpoint. */
final class ProductController extends Controller
{
    public function __construct(
        Request $request,
        JsonView $view,
        private readonly ProductRepositoryInterface $products,
    ) {
        parent::__construct($request, $view);
    }

    /** Returns every product. */
    public function list(): void
    {
        $this->view->success(200, ['products' => $this->products->findAll()]);
    }
}
