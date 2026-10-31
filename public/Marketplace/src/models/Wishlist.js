/** Represents the account's saved favorites. */
export class Wishlist {
    #productIds;

    /** Creates a wishlist from product ids. */
    constructor(productIds = []) {
        this.#productIds = productIds;
    }

    /** Builds a wishlist from untrusted JSON data. */
    static fromJSON(value) {
        if (!Array.isArray(value?.productIds) || !value.productIds.every(Number.isInteger)) {
            throw new Error("Data favorit dari server tidak valid.");
        }
        return new Wishlist(value.productIds);
    }

    /** The saved product ids. */
    get productIds() {
        return [...this.#productIds];
    }

    /** The number of favorite products. */
    get count() {
        return this.#productIds.length;
    }

    /** Reports whether a product is a favorite. */
    has(productId) {
        return this.#productIds.includes(productId);
    }
}
