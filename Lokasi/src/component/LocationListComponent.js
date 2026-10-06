/** Renders location cards and the list's loading, empty, and error states. */
export class LocationListComponent {
    #root;
    #onSelect;
    #onReset;
    #onRetry;

    /** Creates a list with callbacks for selection and recovery actions. */
    constructor(root, { onSelect, onReset, onRetry }) {
        this.#root = root;
        this.#onSelect = onSelect;
        this.#onReset = onReset;
        this.#onRetry = onRetry;
    }

    /** Renders locations or the supplied request state. */
    render({ locations = [], selectedId = null, status = "ready", error = "" } = {}) {
        if (status === "loading") {
            this.#root.replaceChildren(this.#message("Memuat lokasi...", "loading"));
            return;
        }
        if (status === "error") {
            const message = this.#message(`Gagal memuat lokasi: ${error}`, "error");
            message.append(this.#actionButton("Coba lagi", this.#onRetry));
            this.#root.replaceChildren(message);
            return;
        }
        if (!locations.length) {
            const message = this.#message("Lokasi tidak ditemukan", "empty");
            message.append(this.#actionButton("Reset pencarian", this.#onReset));
            this.#root.replaceChildren(message);
            return;
        }

        const fragment = document.createDocumentFragment();
        locations.forEach((location) => fragment.append(this.#createLocation(location, selectedId)));
        this.#root.replaceChildren(fragment);
    }

    /** Scrolls a visible location card into view. */
    scrollToLocation(id) {
        const item = [...this.#root.querySelectorAll("[data-location-id]")]
            .find((candidate) => candidate.dataset.locationId === String(id));
        item?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    #createLocation(location, selectedId) {
        const item = document.createElement("article");
        item.className = `location-item${location.id === selectedId ? " is-selected" : ""}`;
        item.dataset.locationId = String(location.id);
        item.tabIndex = 0;
        item.setAttribute("role", "button");
        item.setAttribute("aria-label", `Pilih ${location.nama}`);
        item.setAttribute("aria-pressed", String(location.id === selectedId));
        item.addEventListener("click", (event) => {
            if (!event.target.closest("a")) this.#onSelect(location.id);
        });
        item.addEventListener("keydown", (event) => {
            if ((event.key === "Enter" || event.key === " ") && event.target === item) {
                event.preventDefault();
                this.#onSelect(location.id);
            }
        });

        const title = document.createElement("h3");
        title.className = "location-item-name";
        title.textContent = location.nama;

        const directions = document.createElement("a");
        directions.className = "location-directions";
        directions.href = location.directionsUrl;
        directions.target = "_blank";
        directions.rel = "noopener noreferrer";
        directions.setAttribute("aria-label", `Buka rute ke ${location.nama} di Google Maps`);
        directions.textContent = "➤";

        const address = document.createElement("p");
        address.className = "location-item-detail";
        address.append(this.#icon("▦"), document.createTextNode(location.alamat));

        const phone = document.createElement("a");
        phone.className = "location-item-detail location-phone";
        phone.href = `tel:${location.telepon.replace(/[^\d+]/g, "")}`;
        phone.addEventListener("click", (event) => event.stopPropagation());
        phone.append(this.#icon("☎"), document.createTextNode(location.telepon));

        item.append(title, directions, address, phone);
        return item;
    }

    #icon(symbol) {
        const icon = document.createElement("span");
        icon.className = "location-detail-icon";
        icon.setAttribute("aria-hidden", "true");
        icon.textContent = symbol;
        return icon;
    }

    #message(text, state) {
        const message = document.createElement("div");
        message.className = `location-list-message is-${state}`;
        message.setAttribute("role", state === "error" ? "alert" : "status");
        message.textContent = text;
        return message;
    }

    #actionButton(label, action) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "location-state-action";
        button.textContent = label;
        button.addEventListener("click", action);
        return button;
    }
}
