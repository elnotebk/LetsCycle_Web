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
        this.#root.classList.add("city-filter");
        this.#button = document.createElement("button");
        this.#button.type = "button";
        this.#button.className = "city-filter-button";
        this.#button.setAttribute("aria-haspopup", "listbox");
        this.#button.setAttribute("aria-expanded", "false");
        this.#button.addEventListener("click", () => this.#toggle());

        this.#dropdown = document.createElement("div");
        this.#dropdown.className = "city-filter-dropdown";
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
            option.className = "city-filter-option";
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
