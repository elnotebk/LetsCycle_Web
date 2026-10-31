/** Renders one product from the page's card template and reports its button clicks. */
export class ProductCardComponent {
    #element;
    #addButton;
    #wishButton;

    /** Creates a card for a product from a template element. */
    constructor(template, product, { onAdd, onToggleWishlist }) {
        this.product = product;
        this.#element = template.content.firstElementChild.cloneNode(true);
        this.#addButton = this.#element.querySelector(".product-card__btn");
        this.#wishButton = this.#element.querySelector(".product-card__wish-btn");

        const image = this.#element.querySelector("[data-product-image]");
        image.src = product.imageUrl;
        image.alt = product.imageAlt;
        this.#setText("[data-product-label]", product.label);
        this.#setText(".product-card__name", product.name);
        this.#setText("[data-product-price]", product.formattedPrice);
        this.#setText("[data-product-rating]", product.rating.toFixed(1));
        this.#setText("[data-product-reviews]", `(${product.reviewCount} ulasan)`);
        this.#addButton.setAttribute("aria-label", `Tambah ${product.name} ke Keranjang`);
        this.#wishButton.setAttribute("aria-label", `Tambah ${product.name} ke Favorit`);

        this.#addButton.addEventListener("click", () => onAdd(this));
        this.#wishButton.addEventListener("click", () => onToggleWishlist(this));
    }

    /** The card's root element. */
    get element() {
        return this.#element;
    }

    /** Shows or hides the card. */
    setVisible(visible) {
        this.#element.style.display = visible ? "" : "none";
    }

    /** Shows whether the product is a favorite. */
    setWishlisted(wishlisted) {
        this.#wishButton.setAttribute("aria-pressed", String(wishlisted));
    }

    /** Blocks the card's buttons while a change is being saved. */
    setBusy(busy) {
        this.#addButton.disabled = busy;
        this.#wishButton.disabled = busy;
    }

    #setText(selector, text) {
        this.#element.querySelector(selector).textContent = text;
    }
}
