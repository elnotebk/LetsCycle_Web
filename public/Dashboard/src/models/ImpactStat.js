/** Represents one community impact figure and how it is displayed. */
export class ImpactStat {
    constructor({ value, decimals = 0, prefix = "", suffix = "" }) {
        this.value = value;
        this.decimals = decimals;
        this.prefix = prefix;
        this.suffix = suffix;
        Object.freeze(this);
    }

    /** Formats the figure, or a value on the way to it, for Indonesian readers. */
    format(value = this.value) {
        const formatted = new Intl.NumberFormat("id-ID", {
            minimumFractionDigits: this.decimals,
            maximumFractionDigits: this.decimals,
        }).format(value);
        return `${this.prefix}${formatted}${this.suffix}`;
    }
}
