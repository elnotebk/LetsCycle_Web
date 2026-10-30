/** Represents a validated recycling drop-off location. */
export class Location {
    constructor({ id, nama, alamat, telepon, kota, lat, lng }) {
        this.id = id;
        this.nama = nama;
        this.alamat = alamat;
        this.telepon = telepon;
        this.kota = kota;
        this.lat = lat;
        this.lng = lng;
    }

    /** Builds a location from untrusted JSON data. */
    static fromJSON(value) {
        if (!value || typeof value !== "object" ||
            !Number.isInteger(value.id) ||
            !["nama", "alamat", "telepon", "kota"].every((key) =>
                typeof value[key] === "string" && value[key].trim()) ||
            !Number.isFinite(value.lat) || !Number.isFinite(value.lng) ||
            value.lat < -90 || value.lat > 90 || value.lng < -180 || value.lng > 180) {
            throw new Error("Data lokasi dari server tidak valid.");
        }
        return new Location(value);
    }

    /** Returns a Google Maps route URL for this location. */
    get directionsUrl() {
        return `https://www.google.com/maps/dir/?api=1&destination=${this.lat},${this.lng}`;
    }
}
