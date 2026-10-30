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
        wrapper.className = "relative flex h-[38px] min-w-0 items-center rounded-lg border border-[#AEB8B0] bg-white focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(58,125,68,0.13)]";
        const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        icon.setAttribute("class", "ml-2.5 h-4 w-4 flex-[0_0_16px] fill-none stroke-muted stroke-[1.7] [stroke-linecap:round]");
        icon.setAttribute("aria-hidden", "true");
        icon.setAttribute("viewBox", "0 0 24 24");
        const iconPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        iconPath.setAttribute("d", "m20 20-4.3-4.3M18 10.8a7.2 7.2 0 1 1-14.4 0 7.2 7.2 0 0 1 14.4 0Z");
        icon.append(iconPath);

        this.#input = document.createElement("input");
        this.#input.className = "h-full w-full min-w-0 bg-transparent pl-[7px] pr-0.5 text-[12px] text-ink outline-none placeholder:text-[#8B938E] [&::-webkit-search-cancel-button]:appearance-none";
        this.#input.type = "search";
        this.#input.name = "location-search";
        this.#input.placeholder = "Cari lokasi...";
        this.#input.setAttribute("aria-label", "Cari lokasi berdasarkan nama atau alamat");
        this.#input.autocomplete = "off";
        this.#input.addEventListener("input", () => this.#handleInput());

        this.#clearButton = document.createElement("button");
        this.#clearButton.type = "button";
        this.#clearButton.className = "mr-1 grid h-7 w-7 flex-[0_0_28px] cursor-pointer place-items-center rounded-full p-0 text-[20px] leading-none text-muted hover:bg-soft hover:text-teal [&[hidden]]:hidden";
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
