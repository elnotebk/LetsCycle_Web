/** Opens a dropdown listing the products behind a toolbar button. */
export class ProductPanelComponent {
    #button;
    #panel;
    #list;
    #getEmptyText;
    #getRows;

    /** Creates a panel below a button, reading its content from callbacks. */
    constructor(button, { title, getEmptyText, getRows }) {
        this.#button = button;
        this.#getEmptyText = getEmptyText;
        this.#getRows = getRows;

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
            // composedPath still holds a row that was redrawn away during this click.
            const path = event.composedPath();
            if (!path.includes(button) && !path.includes(this.#panel)) this.#close();
        });
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") this.#close();
        });
    }

    /** Redraws the rows from the current data. */
    refresh() {
        const rows = this.#getRows();
        if (!rows.length) {
            this.#list.replaceChildren(this.#createText(this.#getEmptyText()));
            return;
        }
        this.#list.replaceChildren(...rows.map((row) => this.#createRow(row)));
    }

    #createRow({ label, onRemove }) {
        const row = document.createElement("div");
        row.className = "flex items-center justify-between gap-3";
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "cursor-pointer text-[11px] font-bold text-[#8F342F] hover:underline";
        remove.textContent = "Hapus";
        remove.setAttribute("aria-label", `Hapus ${label}`);
        remove.addEventListener("click", onRemove);
        row.append(this.#createText(label), remove);
        return row;
    }

    #createText(text) {
        const element = document.createElement("span");
        element.className = "text-[12px] text-muted [overflow-wrap:anywhere]";
        element.textContent = text;
        return element;
    }

    #toggle() {
        if (this.#panel.hidden) {
            this.refresh();
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
