/** Opens a dropdown listing the products behind a toolbar button. */
export class ProductPanelComponent {
    #button;
    #panel;
    #list;
    #emptyText;
    #getLabels;

    /** Creates a panel below a button, reading its rows from a callback. */
    constructor(button, { title, emptyText, getLabels }) {
        this.#button = button;
        this.#emptyText = emptyText;
        this.#getLabels = getLabels;

        this.#panel = document.createElement("div");
        this.#panel.className = "absolute right-0 top-[calc(100%+12px)] z-30 grid w-[min(290px,calc(100vw-32px))] gap-[7px] rounded-[15px] border border-line bg-white p-[19px] text-ink shadow-[0_16px_36px_rgba(38,50,56,0.18)] [&[hidden]]:hidden";
        this.#panel.hidden = true;
        const heading = document.createElement("strong");
        heading.className = "text-[15px] text-ink";
        heading.textContent = title;
        this.#list = document.createElement("div");
        this.#list.className = "grid gap-[7px]";
        this.#panel.append(heading, this.#list);
        button.parentElement.append(this.#panel);

        button.setAttribute("aria-haspopup", "true");
        button.setAttribute("aria-expanded", "false");
        button.addEventListener("click", () => this.#toggle());
        document.addEventListener("click", (event) => {
            if (!button.contains(event.target) && !this.#panel.contains(event.target)) this.#close();
        });
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") this.#close();
        });
    }

    #refresh() {
        const labels = this.#getLabels();
        this.#list.replaceChildren(...(labels.length ? labels : [this.#emptyText]).map((label) => {
            const row = document.createElement("span");
            row.className = "text-[12px] text-muted [overflow-wrap:anywhere]";
            row.textContent = label;
            return row;
        }));
    }

    #toggle() {
        if (this.#panel.hidden) {
            this.#refresh();
            this.#panel.hidden = false;
            this.#button.setAttribute("aria-expanded", "true");
        } else {
            this.#close();
        }
    }

    #close() {
        this.#panel.hidden = true;
        this.#button.setAttribute("aria-expanded", "false");
    }
}
