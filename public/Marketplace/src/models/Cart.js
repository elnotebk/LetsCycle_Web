/** Tracks how many of each product the shopper has added. */
export class Cart {
    #quantities = new Map();

    /** Adds one unit of a product. */
    add(product) {
        this.#quantities.set(product, (this.#quantities.get(product) || 0) + 1);
    }

    /** The total number of units in the cart. */
    get count() {
        return [...this.#quantities.values()].reduce((total, quantity) => total + quantity, 0);
    }
}
