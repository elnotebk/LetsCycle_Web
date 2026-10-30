import { ApiClient, getApiOrigin } from "../../../Dashboard/src/services/ApiClient.js";
import { Location } from "../models/Location.js";

/** Retrieves location records from the LetCycle API. */
export class LocationService {
    /** Creates a location service with an injectable API client. */
    constructor(apiClient = new ApiClient(`${getApiOrigin()}/api`)) {
        this.apiClient = apiClient;
    }

    /** Fetches locations matching the supplied search and city filters. */
    async fetchAll({ q = "", kota = "" } = {}) {
        const params = new URLSearchParams();
        if (q.trim()) params.set("q", q.trim());
        if (kota.trim()) params.set("kota", kota.trim());
        const query = params.toString();
        const suffix = query ? `?${query}` : "";
        const result = await this.apiClient.get(`/locations${suffix}`);
        if (!Array.isArray(result.locations)) {
            throw new Error("Server API mengirim daftar lokasi yang tidak valid.");
        }
        return result.locations.map((location) => Location.fromJSON(location));
    }

    /** Fetches the distinct city names available for filtering. */
    async fetchCities() {
        const result = await this.apiClient.get("/locations/cities");
        if (!Array.isArray(result.cities) ||
            !result.cities.every((city) => typeof city === "string")) {
            throw new Error("Server API mengirim daftar kota yang tidak valid.");
        }
        return result.cities;
    }
}
