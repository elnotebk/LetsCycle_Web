import { ApiClient, getApiOrigin } from "../../../Dashboard/src/services/ApiClient.js";
import { Cart } from "../models/Cart.js";
import { Product } from "../models/Product.js";
import { Wishlist } from "../models/Wishlist.js";

/** Retrieves products and saves the account's cart and wishlist through the API. */
export class MarketplaceService {
    /** Creates a marketplace service with an injectable API client. */
    constructor(apiClient = new ApiClient(`${getApiOrigin()}/api`)) {
        this.apiClient = apiClient;
    }

    /** Fetches the product catalog. */
    async fetchProducts() {
        const result = await this.apiClient.get("/products");
        if (!Array.isArray(result.products)) {
            throw new Error("Server API mengirim daftar produk yang tidak valid.");
        }
        return result.products.map((product) => Product.fromJSON(product));
    }

    /** Fetches the saved cart. */
    async fetchCart() {
        return Cart.fromJSON((await this.apiClient.get("/cart")).cart);
    }

    /** Adds one unit of a product and returns the saved cart. */
    async addToCart(productId) {
        return Cart.fromJSON((await this.apiClient.post("/cart/add", { productId })).cart);
    }

    /** Removes a product and returns the saved cart. */
    async removeFromCart(productId) {
        return Cart.fromJSON((await this.apiClient.post("/cart/remove", { productId })).cart);
    }

    /** Fetches the saved wishlist. */
    async fetchWishlist() {
        return Wishlist.fromJSON((await this.apiClient.get("/wishlist")).wishlist);
    }

    /** Adds or removes a favorite and returns the saved wishlist. */
    async toggleWishlist(productId) {
        return Wishlist.fromJSON((await this.apiClient.post("/wishlist/toggle", { productId })).wishlist);
    }
}
