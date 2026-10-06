import { CityFilterComponent } from "../component/CityFilterComponent.js";
import { FooterComponent } from "../component/FooterComponent.js";
import { LocationListComponent } from "../component/LocationListComponent.js";
import { LocationMapComponent } from "../component/LocationMapComponent.js";
import { SearchBarComponent } from "../component/SearchBarComponent.js";
import { LocationService } from "../services/LocationService.js";

/** Coordinates location search, selection, map updates, and page feedback. */
export class LokasiPage {
    #service;
    #searchBar;
    #cityFilter;
    #locationList;
    #locationMap;
    #query = "";
    #kota = "";
    #selectedId = null;
    #locations = [];
    #requestVersion = 0;

    /** Creates the page controller with its reusable UI components. */
    constructor(service = new LocationService()) {
        this.#service = service;
        this.#searchBar = new SearchBarComponent(
            document.querySelector("[data-location-search]"),
            (query) => {
                this.#query = query;
                this.#fetchLocations();
            },
        );
        this.#cityFilter = new CityFilterComponent(
            document.querySelector("[data-city-filter]"),
            (kota) => {
                this.#kota = kota;
                this.#fetchLocations();
            },
        );
        this.#locationList = new LocationListComponent(
            document.querySelector("[data-location-list]"),
            {
                onSelect: (id) => this.#selectFromList(id),
                onReset: () => this.#resetFilters(),
                onRetry: () => this.#loadInitialData(),
            },
        );
        this.#locationMap = new LocationMapComponent(
            document.querySelector("[data-location-map]"),
            (id) => this.#selectFromMap(id),
        );
    }

    /** Renders the page components and loads initial location data. */
    async init() {
        this.#searchBar.render();
        this.#cityFilter.render();
        this.#locationList.render({ status: "loading" });
        this.#locationMap.render();
        new FooterComponent(document.querySelector("[data-site-footer]")).render();
        await this.#loadInitialData();
    }

    async #loadInitialData() {
        const version = ++this.#requestVersion;
        this.#locationList.render({ status: "loading" });
        try {
            const [locations, cities] = await Promise.all([
                this.#service.fetchAll({ q: this.#query, kota: this.#kota }),
                this.#service.fetchCities(),
            ]);
            if (version !== this.#requestVersion) return;
            this.#cityFilter.setCities(cities);
            this.#setLocations(locations);
        } catch (error) {
            if (version !== this.#requestVersion) return;
            this.#locations = [];
            this.#selectedId = null;
            this.#locationMap.setLocations([]);
            this.#locationList.render({
                status: "error",
                error: error.message || "Terjadi kesalahan pada server.",
            });
        }
    }

    async #fetchLocations() {
        const version = ++this.#requestVersion;
        this.#locationList.render({ status: "loading" });
        try {
            const locations = await this.#service.fetchAll({ q: this.#query, kota: this.#kota });
            if (version !== this.#requestVersion) return;
            this.#setLocations(locations);
        } catch (error) {
            if (version !== this.#requestVersion) return;
            this.#locations = [];
            this.#selectedId = null;
            this.#locationMap.setLocations([]);
            this.#locationList.render({
                status: "error",
                error: error.message || "Terjadi kesalahan pada server.",
            });
        }
    }

    #setLocations(locations) {
        this.#locations = locations;
        if (!locations.some((location) => location.id === this.#selectedId)) {
            this.#selectedId = null;
        }
        this.#locationList.render({
            locations: this.#locations,
            selectedId: this.#selectedId,
        });
        this.#locationMap.setLocations(this.#locations);
    }

    #selectFromList(id) {
        this.#selectedId = id;
        this.#locationList.render({
            locations: this.#locations,
            selectedId: this.#selectedId,
        });
        this.#locationMap.focusLocation(id);
        this.#locationList.scrollToLocation(id);
    }

    #selectFromMap(id) {
        this.#selectedId = id;
        this.#locationList.render({
            locations: this.#locations,
            selectedId: this.#selectedId,
        });
        this.#locationList.scrollToLocation(id);
    }

    #resetFilters() {
        this.#query = "";
        this.#kota = "";
        this.#selectedId = null;
        this.#searchBar.setQuery("");
        this.#cityFilter.setSelectedCity("");
        this.#fetchLocations();
    }
}

const pageRoot = document.querySelector("[data-location-page]");
if (pageRoot) new LokasiPage().init();
