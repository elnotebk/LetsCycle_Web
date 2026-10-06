/** Renders Leaflet markers and safe location detail popups. */
export class LocationMapComponent {
    #root;
    #onSelect;
    #map;
    #markers = new Map();
    #locations = [];

    /** Creates a map that reports marker selections through a callback. */
    constructor(root, onSelect) {
        this.#root = root;
        this.#onSelect = onSelect;
    }

    /** Creates the Leaflet map and its OpenStreetMap tile layer. */
    render() {
        const canvas = document.createElement("div");
        canvas.className = "location-map-canvas";
        canvas.setAttribute("role", "application");
        canvas.setAttribute("aria-label", "Peta titik lokasi penukaran");
        this.#root.replaceChildren(canvas);
        if (!window.L) {
            const message = document.createElement("p");
            message.className = "location-map-error";
            message.textContent = "Peta tidak dapat dimuat. Periksa koneksi internet lalu muat ulang halaman.";
            this.#root.replaceChildren(message);
            return;
        }

        this.#map = window.L.map(canvas, { scrollWheelZoom: false }).setView([-7.55, 112.65], 8);
        window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(this.#map);
    }

    /** Replaces map markers and fits the map to the current results. */
    setLocations(locations) {
        this.#locations = locations;
        if (!this.#map) return;
        this.#markers.forEach((marker) => marker.remove());
        this.#markers.clear();

        locations.forEach((location) => {
            const marker = window.L.marker([location.lat, location.lng], {
                icon: window.L.divIcon({
                    className: "location-marker",
                    html: '<span aria-hidden="true"></span>',
                    iconSize: [26, 34],
                    iconAnchor: [13, 32],
                }),
            }).addTo(this.#map);
            marker.bindPopup(this.#createPopup(location));
            marker.on("click", () => this.#onSelect(location.id));
            this.#markers.set(location.id, marker);
        });

        if (locations.length === 1) {
            this.#map.setView([locations[0].lat, locations[0].lng], 14);
        } else if (locations.length > 1) {
            const bounds = window.L.latLngBounds(locations.map(({ lat, lng }) => [lat, lng]));
            this.#map.fitBounds(bounds, { padding: [28, 28], maxZoom: 14 });
        } else {
            this.#map.setView([-7.55, 112.65], 8);
        }
    }

    /** Moves the map to a location and opens its marker popup. */
    focusLocation(id) {
        const location = this.#locations.find((candidate) => candidate.id === id);
        const marker = this.#markers.get(id);
        if (!location || !marker) return;
        this.#map.flyTo([location.lat, location.lng], Math.max(this.#map.getZoom(), 14));
        marker.openPopup();
    }

    #createPopup(location) {
        const content = document.createElement("div");
        content.className = "location-popup";
        const title = document.createElement("strong");
        title.textContent = location.nama;
        const address = document.createElement("p");
        address.textContent = location.alamat;
        const phone = document.createElement("a");
        phone.href = `tel:${location.telepon.replace(/[^\d+]/g, "")}`;
        phone.textContent = location.telepon;
        const directions = document.createElement("a");
        directions.href = location.directionsUrl;
        directions.target = "_blank";
        directions.rel = "noopener noreferrer";
        directions.className = "location-popup-directions";
        directions.textContent = "Rute";
        content.append(title, address, phone, directions);
        return content;
    }
}
