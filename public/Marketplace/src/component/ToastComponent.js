const DISPLAY_MILLISECONDS = 2800;

/** Shows short status messages in the corner of the page. */
export class ToastComponent {
    #element = null;
    #hideTimeout;

    /** Displays a message, replacing any message already showing. */
    show(message) {
        const element = this.#element ??= this.#create();
        element.querySelector("span").textContent = message;
        element.dataset.visible = "true";

        window.clearTimeout(this.#hideTimeout);
        this.#hideTimeout = window.setTimeout(() => {
            delete element.dataset.visible;
        }, DISPLAY_MILLISECONDS);
    }

    #create() {
        const element = document.createElement("div");
        element.className = "market-toast pointer-events-none fixed bottom-6 right-6 z-[1000] flex translate-y-5 items-center gap-2.5 rounded-[12px] bg-ink px-[22px] py-3.5 text-[13.5px] font-semibold text-white opacity-0 shadow-[0_12px_30px_rgba(0,0,0,0.2)] transition-[opacity,transform] duration-300 data-[visible]:translate-y-0 data-[visible]:opacity-100";
        element.setAttribute("role", "status");
        element.setAttribute("aria-live", "polite");
        element.innerHTML = `
      <svg class="h-5 w-5 shrink-0 text-lime" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <span></span>
    `;
        document.body.appendChild(element);
        return element;
    }
}
