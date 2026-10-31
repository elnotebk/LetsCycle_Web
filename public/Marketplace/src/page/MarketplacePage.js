import { AuthService } from "../../../Dashboard/src/services/AuthService.js";
import { ProductCardComponent } from "../component/ProductCardComponent.js";
import { ProductPanelComponent } from "../component/ProductPanelComponent.js";
import { ToastComponent } from "../component/ToastComponent.js";
import { Cart } from "../models/Cart.js";
import { Wishlist } from "../models/Wishlist.js";
import { MarketplaceService } from "../services/MarketplaceService.js";

const SIGN_IN_MESSAGE = "Masuk terlebih dahulu untuk menyimpan produk.";

/**
 * Coordinates interactive features on the LetCycle Marketplace page:
 * - Product catalog loading
 * - Search and category filtering
 * - Saved cart and wishlist
 */
export class MarketplacePage {
  #service;
  #authService;
  #cart = new Cart();
  #wishlist = new Wishlist();
  #toast = new ToastComponent();
  #cartPanel;
  #wishlistPanel;
  #cards = [];
  #signedIn = false;
  #activeCategory = "all";
  #searchQuery = "";

  constructor(service = new MarketplaceService(), authService = new AuthService()) {
    this.#service = service;
    this.#authService = authService;
    this.#initCategoryFilters();
    this.#initSearch();
    this.#initPanels();
  }

  /** Loads the catalog, then the signed-in account's saved products. */
  async init() {
    const status = document.querySelector("[data-product-status]");
    try {
      this.#renderProducts(await this.#service.fetchProducts());
      status.remove();
    } catch (error) {
      status.textContent = `Gagal memuat produk: ${error.message}`;
      return;
    }

    try {
      this.#signedIn = (await this.#authService.getCurrentUser()) !== null;
      if (!this.#signedIn) return;
      [this.#cart, this.#wishlist] = await Promise.all([
        this.#service.fetchCart(),
        this.#service.fetchWishlist(),
      ]);
      this.#showSavedState();
    } catch (error) {
      this.#toast.show(error.message);
    }
  }

  #renderProducts(products) {
    const template = document.getElementById("product-card-template");
    this.#cards = products.map((product) => new ProductCardComponent(template, product, {
      onAdd: (card) => this.#addToCart(card),
      onToggleWishlist: (card) => this.#toggleWishlist(card),
    }));
    document.querySelector("[data-product-grid]").append(...this.#cards.map((card) => card.element));
    this.#filterProducts();
  }

  #initPanels() {
    this.#cartPanel = new ProductPanelComponent(document.querySelector('[data-product-panel="cart"]'), {
      title: "Keranjang",
      getEmptyText: () => (this.#signedIn ? "Keranjang masih kosong." : SIGN_IN_MESSAGE),
      getRows: () => this.#cart.items.flatMap(({ productId, quantity }) => {
        const card = this.#findCard(productId);
        return card ? [{
          label: `${card.product.name} × ${quantity}`,
          onRemove: () => this.#removeFromCart(productId),
        }] : [];
      }),
    });
    this.#wishlistPanel = new ProductPanelComponent(document.querySelector('[data-product-panel="wishlist"]'), {
      title: "Favorit",
      getEmptyText: () => (this.#signedIn ? "Belum ada produk favorit." : SIGN_IN_MESSAGE),
      getRows: () => this.#wishlist.productIds.flatMap((productId) => {
        const card = this.#findCard(productId);
        return card ? [{ label: card.product.name, onRemove: () => this.#toggleWishlist(card) }] : [];
      }),
    });
  }

  #initCategoryFilters() {
    const pills = document.querySelectorAll(".category-pill");
    pills.forEach((pill) => {
      pill.addEventListener("click", () => {
        pills.forEach((p) => p.setAttribute("aria-pressed", "false"));
        pill.setAttribute("aria-pressed", "true");
        this.#activeCategory = pill.dataset.category || "all";
        this.#filterProducts();
      });
    });
  }

  #initSearch() {
    const searchInput = document.getElementById("marketplace-search-input");
    if (!searchInput) return;

    searchInput.addEventListener("input", (e) => {
      this.#searchQuery = e.target.value.trim().toLowerCase();
      this.#filterProducts();
    });
  }

  #filterProducts() {
    const filter = { category: this.#activeCategory, query: this.#searchQuery };
    let visibleCount = 0;

    this.#cards.forEach((card) => {
      const visible = card.product.matches(filter);
      card.setVisible(visible);
      if (visible) visibleCount++;
    });

    const emptyNotice = document.getElementById("no-products-notice");
    if (emptyNotice) {
      emptyNotice.hidden = visibleCount !== 0;
    }
  }

  #findCard(productId) {
    return this.#cards.find((card) => card.product.id === productId);
  }

  async #addToCart(card) {
    if (!this.#signedIn) {
      this.#toast.show(SIGN_IN_MESSAGE);
      return;
    }
    card.setBusy(true);
    try {
      this.#cart = await this.#service.addToCart(card.product.id);
      this.#showSavedState();
      this.#toast.show(`"${card.product.name}" ditambahkan ke keranjang belanja!`);
    } catch (error) {
      this.#toast.show(error.message);
    } finally {
      card.setBusy(false);
    }
  }

  async #removeFromCart(productId) {
    try {
      this.#cart = await this.#service.removeFromCart(productId);
      this.#showSavedState();
    } catch (error) {
      this.#toast.show(error.message);
    }
  }

  async #toggleWishlist(card) {
    if (!this.#signedIn) {
      this.#toast.show(SIGN_IN_MESSAGE);
      return;
    }
    card.setBusy(true);
    try {
      this.#wishlist = await this.#service.toggleWishlist(card.product.id);
      this.#showSavedState();
      this.#toast.show(this.#wishlist.has(card.product.id)
        ? `"${card.product.name}" ditambahkan ke favorit!`
        : `"${card.product.name}" dihapus dari favorit.`);
    } catch (error) {
      this.#toast.show(error.message);
    } finally {
      card.setBusy(false);
    }
  }

  #showSavedState() {
    this.#setBadge("cart-badge", this.#cart.count);
    this.#setBadge("wishlist-badge", this.#wishlist.count);
    this.#cards.forEach((card) => card.setWishlisted(this.#wishlist.has(card.product.id)));
    this.#cartPanel.refresh();
    this.#wishlistPanel.refresh();
  }

  #setBadge(id, count) {
    const badge = document.getElementById(id);
    if (badge) badge.textContent = count;
  }
}

// Auto-initialize when document is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => new MarketplacePage().init());
} else {
  new MarketplacePage().init();
}
