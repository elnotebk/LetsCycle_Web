<?php

declare(strict_types=1);

namespace LetCycle\Controllers;

use LetCycle\Core\ApiError;
use LetCycle\Core\Request;
use LetCycle\Core\Session;
use LetCycle\Models\Cart;
use LetCycle\Models\Wishlist;
use LetCycle\Repositories\ProductRepositoryInterface;
use LetCycle\Repositories\UserListRepositoryInterface;
use LetCycle\Repositories\UserRepositoryInterface;
use LetCycle\Views\JsonView;

/** Handles the signed-in account's cart and wishlist. */
final class ShoppingController extends Controller
{
    public function __construct(
        Request $request,
        JsonView $view,
        private readonly Session $session,
        private readonly UserRepositoryInterface $users,
        private readonly ProductRepositoryInterface $products,
        private readonly UserListRepositoryInterface $carts,
        private readonly UserListRepositoryInterface $wishlists,
    ) {
        parent::__construct($request, $view);
    }

    /** Returns the account's cart. */
    public function cart(): void
    {
        $this->view->success(200, ['cart' => $this->carts->findByUser($this->requireUserId())]);
    }

    /** Adds one unit of a product to the cart. */
    public function addToCart(): void
    {
        $userId = $this->requireUserId();
        $productId = $this->existingProductId();
        $cart = $this->carts->update($userId, static function (Cart $cart) use ($productId): void {
            if (!$cart->add($productId)) {
                throw new ApiError(409, 'Jumlah produk di keranjang sudah maksimal.');
            }
        });
        $this->view->success(200, ['cart' => $cart]);
    }

    /** Removes a product from the cart, even one no longer sold. */
    public function removeFromCart(): void
    {
        $userId = $this->requireUserId();
        $productId = $this->productId();
        $cart = $this->carts->update($userId, static fn (Cart $cart) => $cart->remove($productId));
        $this->view->success(200, ['cart' => $cart]);
    }

    /** Returns the account's wishlist. */
    public function wishlist(): void
    {
        $this->view->success(200, ['wishlist' => $this->wishlists->findByUser($this->requireUserId())]);
    }

    /** Adds a product to the wishlist, or removes it if already there. */
    public function toggleWishlist(): void
    {
        $userId = $this->requireUserId();
        $productId = $this->existingProductId();
        $wishlist = $this->wishlists->update($userId, static fn (Wishlist $list) => $list->toggle($productId));
        $this->view->success(200, ['wishlist' => $wishlist]);
    }

    private function requireUserId(): int
    {
        $userId = $this->session->userId();
        if ($userId === null || $this->users->findById($userId) === null) {
            throw new ApiError(401, 'Silakan masuk terlebih dahulu.');
        }
        return $userId;
    }

    private function productId(): int
    {
        $productId = $this->request->json()->productId ?? null;
        if (!is_int($productId)) {
            throw new ApiError(400, 'Produk tidak valid.');
        }
        return $productId;
    }

    private function existingProductId(): int
    {
        $productId = $this->productId();
        if ($this->products->findById($productId) === null) {
            throw new ApiError(404, 'Produk tidak ditemukan.');
        }
        return $productId;
    }
}
