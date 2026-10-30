const detailClasses = "flex min-w-0 items-start gap-1.5 overflow-hidden text-ellipsis text-[11px] leading-[1.45] text-muted";

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
        item.className = "relative grid min-h-[86px] cursor-pointer content-center gap-0.5 border-b border-[#DCE2DB] pb-[11px] pl-[5px] pr-[37px] pt-3 transition-colors duration-[140ms] hover:bg-[#F8FAF6] aria-pressed:border-b-line aria-pressed:bg-soft aria-pressed:shadow-[inset_3px_0_#3A7D44]";
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
        title.className = "mb-px truncate text-[13px] font-bold leading-[1.4] text-teal";
        title.textContent = location.nama;

        const directions = document.createElement("a");
        directions.className = "absolute right-2 top-[11px] grid h-[27px] w-[27px] -rotate-[35deg] place-items-center rounded-full text-[14px] text-muted hover:bg-soft hover:text-primary";
        directions.href = location.directionsUrl;
        directions.target = "_blank";
        directions.rel = "noopener noreferrer";
        directions.setAttribute("aria-label", `Buka rute ke ${location.nama} di Google Maps`);
        directions.textContent = "➤";

        const address = document.createElement("p");
        address.className = detailClasses;
        address.append(this.#icon("▦"), document.createTextNode(location.alamat));

        const phone = document.createElement("a");
        phone.className = `${detailClasses} w-fit hover:text-primary hover:underline`;
        phone.href = `tel:${location.telepon.replace(/[^\d+]/g, "")}`;
        phone.addEventListener("click", (event) => event.stopPropagation());
        phone.append(this.#icon("☎"), document.createTextNode(location.telepon));

        item.append(title, directions, address, phone);
        return item;
    }

    #icon(symbol) {
        const icon = document.createElement("span");
        icon.className = "w-[13px] flex-[0_0_13px] text-center text-[11px] leading-[1.45] text-ink";
        icon.setAttribute("aria-hidden", "true");
        icon.textContent = symbol;
        return icon;
    }

    #message(text, state) {
        const message = document.createElement("div");
        message.className = "flex min-h-full flex-col items-center justify-center gap-3 p-6 text-center text-[13px] text-muted data-[state=error]:text-[#8F342F]";
        message.dataset.state = state;
        message.setAttribute("role", state === "error" ? "alert" : "status");
        message.textContent = text;
        return message;
    }

    #actionButton(label, action) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "min-h-9 cursor-pointer rounded-lg border border-primary bg-primary px-3.5 text-[12px] font-bold text-white hover:bg-[#2F6938]";
        button.textContent = label;
        button.addEventListener("click", action);
        return button;
    }
}
