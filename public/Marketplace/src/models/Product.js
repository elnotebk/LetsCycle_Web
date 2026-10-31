/** Represents a marketplace product from the server. */
export class Product {
    constructor({ id, nama, kataKunci, kategori, harga, label, rating, ulasan, gambar, gambarAlt }) {
        this.id = id;
        this.name = nama;
        this.keywords = kataKunci.toLowerCase();
        this.category = kategori;
        this.price = harga;
        this.label = label;
        this.rating = rating;
        this.reviewCount = ulasan;
        this.imageUrl = gambar;
        this.imageAlt = gambarAlt;
        Object.freeze(this);
    }

    /** Builds a product from untrusted JSON data. */
    static fromJSON(value) {
        if (!value || typeof value !== "object" || !Number.isInteger(value.id) ||
            !["nama", "kataKunci", "kategori", "label", "gambar", "gambarAlt"].every((key) => typeof value[key] === "string") ||
            !Number.isFinite(value.harga) || !Number.isFinite(value.rating) || !Number.isInteger(value.ulasan)) {
            throw new Error("Data produk dari server tidak valid.");
        }
        return new Product(value);
    }

    /** The price formatted for Indonesian readers. */
    get formattedPrice() {
        return `Rp ${new Intl.NumberFormat("id-ID").format(this.price)}`;
    }

    /** Reports whether the product passes a category and lowercase search filter. */
    matches({ category, query }) {
        return (category === "all" || this.category === category)
            && (!query || this.keywords.includes(query));
    }
}
