/** Handles JSON responses for the public location endpoints. */
export class LocationController {
    #repository;

    /** Creates a location controller backed by a repository. */
    constructor(repository) {
        this.#repository = repository;
    }

    /** Returns locations filtered by the optional query and city parameters. */
    async list(url, response) {
        const locations = await this.#repository.search({
            q: url.searchParams.get("q") || "",
            kota: url.searchParams.get("kota") || "",
        });
        this.#sendJson(response, 200, { ok: true, locations });
    }

    /** Returns cities available in the location store. */
    async listCities(response) {
        const cities = await this.#repository.listCities();
        this.#sendJson(response, 200, { ok: true, cities });
    }

    #sendJson(response, statusCode, payload) {
        response.writeHead(statusCode, {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-store",
        });
        response.end(JSON.stringify(payload));
    }
}
