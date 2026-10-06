/** Renders the debounced location search input. */
export class SearchBarComponent {
    #root;
    #onSearch;
    #input;
    #clearButton;
    #timer;

    /** Creates a search bar that reports query changes through a callback. */
    constructor(root, onSearch) {
        this.#root = root;
        this.#onSearch = onSearch;
    }

    /** Renders the search field, icon, and clear button. */
    render() {
        const wrapper = document.createElement("div");
        wrapper.className = "location-search";
        const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        icon.setAttribute("class", "location-search-icon");
        icon.setAttribute("aria-hidden", "true");
        icon.setAttribute("viewBox", "0 0 24 24");
        const iconPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        iconPath.setAttribute("d", "m20 20-4.3-4.3M18 10.8a7.2 7.2 0 1 1-14.4 0 7.2 7.2 0 0 1 14.4 0Z");
        icon.append(iconPath);

        this.#input = document.createElement("input");
        this.#input.type = "search";
        this.#input.name = "location-search";
        this.#input.placeholder = "Cari lokasi...";
        this.#input.setAttribute("aria-label", "Cari lokasi berdasarkan nama atau alamat");
        this.#input.autocomplete = "off";
        this.#input.addEventListener("input", () => this.#handleInput());

        this.#clearButton = document.createElement("button");
        this.#clearButton.type = "button";
        this.#clearButton.className = "location-search-clear";
        this.#clearButton.textContent = "×";
        this.#clearButton.setAttribute("aria-label", "Hapus pencarian");
        this.#clearButton.hidden = true;
        this.#clearButton.addEventListener("click", () => this.setQuery("", true));

        wrapper.append(icon, this.#input, this.#clearButton);
        this.#root.replaceChildren(wrapper);
    }

    /** Sets the visible query and optionally sends it immediately. */
    setQuery(query, notify = false) {
        if (!this.#input) return;
        this.#input.value = query;
        this.#clearButton.hidden = !query;
        window.clearTimeout(this.#timer);
        if (notify) this.#onSearch(query);
    }

    #handleInput() {
        const query = this.#input.value;
        this.#clearButton.hidden = !query;
        window.clearTimeout(this.#timer);
        this.#timer = window.setTimeout(() => this.#onSearch(query), 250);
    }
}
