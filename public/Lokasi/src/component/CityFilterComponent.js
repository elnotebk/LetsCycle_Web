/** Renders a city selector with outside-click and Escape dismissal. */
export class CityFilterComponent {
    #root;
    #onChange;
    #button;
    #dropdown;
    #cities = [];
    #selectedCity = "";

    /** Creates a city filter that reports selections through a callback. */
    constructor(root, onChange) {
        this.#root = root;
        this.#onChange = onChange;
    }

    /** Renders the city button and its initially closed dropdown. */
    render() {
        this.#button = document.createElement("button");
        this.#button.type = "button";
        this.#button.className = "h-[38px] min-w-[82px] cursor-pointer rounded-lg border border-primary bg-primary px-3 text-[12px] font-bold text-white hover:bg-[#2F6938] phone:min-w-[76px] phone:px-[9px]";
        this.#button.setAttribute("aria-haspopup", "listbox");
        this.#button.setAttribute("aria-expanded", "false");
        this.#button.addEventListener("click", () => this.#toggle());

        this.#dropdown = document.createElement("div");
        this.#dropdown.className = "thin-scrollbar absolute right-0 top-[calc(100%+6px)] z-10 max-h-[250px] w-max min-w-[165px] max-w-[min(250px,calc(100vw-44px))] overflow-y-auto rounded-[10px] border border-line bg-white p-[5px] shadow-[0_10px_24px_rgba(38,50,56,0.16)] [&[hidden]]:hidden";
        this.#dropdown.setAttribute("role", "listbox");
        this.#dropdown.hidden = true;
        this.#root.replaceChildren(this.#button, this.#dropdown);
        this.#renderLabel();
        this.#renderOptions();

        document.addEventListener("click", (event) => {
            if (!this.#root.contains(event.target)) this.#close();
        });
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") this.#close();
        });
    }

    /** Populates the dropdown using the cities returned by the server. */
    setCities(cities) {
        this.#cities = cities;
        this.#renderOptions();
    }

    /** Updates the selected city without triggering another search. */
    setSelectedCity(city) {
        this.#selectedCity = city;
        this.#renderLabel();
        this.#renderOptions();
    }

    #toggle() {
        if (this.#dropdown.hidden) {
            this.#dropdown.hidden = false;
            this.#button.setAttribute("aria-expanded", "true");
        } else {
            this.#close();
        }
    }

    #close() {
        if (!this.#dropdown) return;
        this.#dropdown.hidden = true;
        this.#button.setAttribute("aria-expanded", "false");
    }

    #renderLabel() {
        if (!this.#button) return;
        this.#button.textContent = `${this.#selectedCity || "Kota"} ∨`;
        this.#button.setAttribute(
            "aria-label",
            this.#selectedCity ? `Kota: ${this.#selectedCity}` : "Pilih kota",
        );
    }

    #renderOptions() {
        if (!this.#dropdown) return;
        const cities = ["", ...this.#cities];
        const fragment = document.createDocumentFragment();
        cities.forEach((city) => {
            const option = document.createElement("button");
            option.type = "button";
            option.className = "block w-full cursor-pointer rounded-md px-2.5 py-[9px] text-left text-[12px] text-ink hover:bg-soft hover:text-teal aria-selected:bg-soft aria-selected:text-teal";
            option.textContent = city || "Semua Kota";
            option.setAttribute("role", "option");
            option.setAttribute("aria-selected", String(city === this.#selectedCity));
            option.addEventListener("click", () => {
                this.#selectedCity = city;
                this.#renderLabel();
                this.#renderOptions();
                this.#close();
                this.#onChange(city);
            });
            fragment.append(option);
        });
        this.#dropdown.replaceChildren(fragment);
    }
}
