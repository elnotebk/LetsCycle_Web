/** Represents a marketplace product. */
export class Product {
    constructor({ name, keywords, category }) {
        this.name = name;
        this.keywords = keywords.toLowerCase();
        this.category = category;
        Object.freeze(this);
    }

    /** Reports whether the product passes a category and lowercase search filter. */
    matches({ category, query }) {
        return (category === "all" || this.category === category)
            && (!query || this.keywords.includes(query));
    }
}
