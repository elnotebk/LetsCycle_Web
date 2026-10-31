import { ProductCardComponent } from "../component/ProductCardComponent.js";
import { ToastComponent } from "../component/ToastComponent.js";
import { Cart } from "../models/Cart.js";
import { Wishlist } from "../models/Wishlist.js";

/**
 * Coordinates interactive features on the LetCycle Marketplace page:
 * - Search filtering
 * - Category pill filtering
 * - Cart and wishlist interactions
 */
export class MarketplacePage {
  #cart = new Cart();
  #wishlist = new Wishlist();
  #toast = new ToastComponent();
  #cards = [];
  #activeCategory = "all";
  #searchQuery = "";

  constructor() {
    this.#cards = [...document.querySelectorAll(".product-card")].map(
      (element) => new ProductCardComponent(element, {
        onAdd: (card) => this.#addToCart(card),
        onToggleWishlist: (card) => this.#toggleWishlist(card),
      }),
    );
    this.#initCategoryFilters();
    this.#initSearch();
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

  #addToCart(card) {
    this.#cart.add(card.product);
    this.#setBadge("cart-badge", this.#cart.count);
    this.#toast.show(`"${card.product.name}" ditambahkan ke keranjang belanja!`);
  }

  #toggleWishlist(card) {
    const wishlisted = this.#wishlist.toggle(card.product);
    card.setWishlisted(wishlisted);
    this.#setBadge("wishlist-badge", this.#wishlist.count);
    this.#toast.show(wishlisted
      ? `"${card.product.name}" ditambahkan ke favorit!`
      : `"${card.product.name}" dihapus dari favorit.`);
  }

  #setBadge(id, count) {
    const badge = document.getElementById(id);
    if (badge) badge.textContent = count;
  }
}

// Auto-initialize when document is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => new MarketplacePage());
} else {
  new MarketplacePage();
}
