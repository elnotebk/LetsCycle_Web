/** Represents the signed-in account returned by the server. */
export class User {
    constructor({ id, nama, email }) {
        this.id = id;
        this.nama = nama;
        this.email = email;
        Object.freeze(this);
    }

    /** Builds a user from untrusted JSON data. */
    static fromJSON(value) {
        if (!value || typeof value !== "object" || !Number.isInteger(value.id) ||
            typeof value.nama !== "string" || typeof value.email !== "string") {
            throw new Error("Data pengguna dari server tidak valid.");
        }
        return new User(value);
    }

    /** Returns up to two initials, falling back to the LetCycle initials. */
    get initials() {
        const initials = this.nama
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part.charAt(0))
            .join("")
            .toUpperCase();
        return initials || "LC";
    }
}
