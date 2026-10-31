/** Tracks the products the shopper has marked as favorites. */
export class Wishlist {
    #products = new Set();

    /** Adds or removes a product, returning whether it is now a favorite. */
    toggle(product) {
        if (this.#products.delete(product)) return false;
        this.#products.add(product);
        return true;
    }

    /** The number of favorite products. */
    get count() {
        return this.#products.size;
    }
}
