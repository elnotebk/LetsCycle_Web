/**
 * Coordinates interactive features on the LetCycle Marketplace page:
 * - Search filtering
 * - Category pill filtering
 * - Cart and wishlist interactions
 */
export class MarketplacePage {
  #cartCount = 0;
  #wishlistCount = 0;
  #activeCategory = "all";
  #searchQuery = "";

  constructor() {
    this.#initCategoryFilters();
    this.#initSearch();
    this.#initCartActions();
    this.#initWishlistActions();
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
    const cards = document.querySelectorAll(".product-card");
    let visibleCount = 0;

    cards.forEach((card) => {
      const category = card.dataset.category || "";
      const name = (card.dataset.name || "").toLowerCase();
      const matchesCategory = this.#activeCategory === "all" || category === this.#activeCategory;
      const matchesSearch = !this.#searchQuery || name.includes(this.#searchQuery);

      if (matchesCategory && matchesSearch) {
        card.style.display = "";
        visibleCount++;
      } else {
        card.style.display = "none";
      }
    });

    const emptyNotice = document.getElementById("no-products-notice");
    if (emptyNotice) {
      emptyNotice.hidden = visibleCount !== 0;
    }
  }

  #initCartActions() {
    const cartBadge = document.getElementById("cart-badge");
    const addButtons = document.querySelectorAll(".product-card__btn");

    addButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const card = btn.closest(".product-card");
        const productName = card?.querySelector(".product-card__name")?.textContent || "Produk";

        this.#cartCount++;
        if (cartBadge) {
          cartBadge.textContent = this.#cartCount;
        }

        this.#showToast(`"${productName}" ditambahkan ke keranjang belanja!`);
      });
    });
  }

  #initWishlistActions() {
    const wishBadge = document.getElementById("wishlist-badge");
    const wishButtons = document.querySelectorAll(".product-card__wish-btn");

    wishButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const card = btn.closest(".product-card");
        const productName = card?.querySelector(".product-card__name")?.textContent || "Produk";
        const isActive = btn.getAttribute("aria-pressed") !== "true";
        btn.setAttribute("aria-pressed", String(isActive));

        if (isActive) {
          this.#wishlistCount++;
          this.#showToast(`"${productName}" ditambahkan ke favorit!`);
        } else {
          this.#wishlistCount = Math.max(0, this.#wishlistCount - 1);
          this.#showToast(`"${productName}" dihapus dari favorit.`);
        }

        if (wishBadge) {
          wishBadge.textContent = this.#wishlistCount;
        }
      });
    });
  }

  #showToast(message) {
    let toast = document.querySelector(".market-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "market-toast pointer-events-none fixed bottom-6 right-6 z-[1000] flex translate-y-5 items-center gap-2.5 rounded-[12px] bg-ink px-[22px] py-3.5 text-[13.5px] font-semibold text-white opacity-0 shadow-[0_12px_30px_rgba(0,0,0,0.2)] transition-[opacity,transform] duration-300 data-[visible]:translate-y-0 data-[visible]:opacity-100";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.appendChild(toast);
    }

    toast.innerHTML = `
      <svg class="h-5 w-5 shrink-0 text-lime" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <span></span>
    `;
    toast.querySelector("span").textContent = message;

    toast.dataset.visible = "true";

    window.clearTimeout(this._toastTimeout);
    this._toastTimeout = window.setTimeout(() => {
      delete toast.dataset.visible;
    }, 2800);
  }
}

// Auto-initialize when document is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => new MarketplacePage());
} else {
  new MarketplacePage();
}
