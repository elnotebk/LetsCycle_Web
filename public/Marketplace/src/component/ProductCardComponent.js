import { Product } from "../models/Product.js";

/** Connects one product card in the page to its product and actions. */
export class ProductCardComponent {
    #element;
    #wishButton;

    /** Reads the product from a card and reports its button clicks. */
    constructor(element, { onAdd, onToggleWishlist }) {
        this.#element = element;
        this.#wishButton = element.querySelector(".product-card__wish-btn");
        this.product = new Product({
            name: element.querySelector(".product-card__name")?.textContent || "Produk",
            keywords: element.dataset.name || "",
            category: element.dataset.category || "",
        });

        element.querySelector(".product-card__btn")?.addEventListener("click", () => onAdd(this));
        this.#wishButton?.addEventListener("click", () => onToggleWishlist(this));
    }

    /** Shows or hides the card. */
    setVisible(visible) {
        this.#element.style.display = visible ? "" : "none";
    }

    /** Shows whether the product is a favorite. */
    setWishlisted(wishlisted) {
        this.#wishButton?.setAttribute("aria-pressed", String(wishlisted));
    }
}
