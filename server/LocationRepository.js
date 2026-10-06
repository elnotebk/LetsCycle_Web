import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const locationsFile = path.join(projectRoot, "data", "locations.txt");

/** Reads and searches the JSON-lines location store. */
export class LocationRepository {
    /** Returns every saved location. */
    async findAll() {
        const contents = await readFile(locationsFile, "utf8");
        return contents.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
    }

    /** Searches location names and addresses, optionally narrowed to a city. */
    async search({ q = "", kota = "" } = {}) {
        const locations = await this.findAll();
        const query = q.trim().toLocaleLowerCase("id");
        const city = kota.trim().toLocaleLowerCase("id");
        return locations.filter((location) => {
            const matchesQuery = !query ||
                `${location.nama} ${location.alamat}`.toLocaleLowerCase("id").includes(query);
            const matchesCity = !city || location.kota.toLocaleLowerCase("id") === city;
            return matchesQuery && matchesCity;
        });
    }

    /** Returns the distinct saved cities in alphabetical order. */
    async listCities() {
        const locations = await this.findAll();
        return [...new Set(locations.map((location) => location.kota))]
            .sort((first, second) => first.localeCompare(second, "id"));
    }
}
