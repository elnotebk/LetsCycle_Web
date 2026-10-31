/** Represents the account's saved cart. */
export class Cart {
    #items;

    /** Creates a cart from product ids and quantities. */
    constructor(items = []) {
        this.#items = items;
    }

    /** Builds a cart from untrusted JSON data. */
    static fromJSON(value) {
        if (!Array.isArray(value?.items) || !value.items.every((item) =>
            Number.isInteger(item?.productId) && Number.isInteger(item?.quantity))) {
            throw new Error("Data keranjang dari server tidak valid.");
        }
        return new Cart(value.items);
    }

    /** Each saved product id with its quantity. */
    get items() {
        return [...this.#items];
    }

    /** The total number of units in the cart. */
    get count() {
        return this.#items.reduce((total, { quantity }) => total + quantity, 0);
    }
}
