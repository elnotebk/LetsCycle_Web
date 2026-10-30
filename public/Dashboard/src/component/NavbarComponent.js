import { AuthService } from "../services/AuthService.js";

/** Renders the reusable guest and signed-in navigation states. */
export class NavbarComponent {
    #root;
    #authService;
    #dashboardUrl;
    #locationUrl;
    #marketplaceUrl;
    #loginUrl;
    #registerUrl;

    /** Creates a navbar for a container and authentication service. */
    constructor(root, authService = new AuthService()) {
        this.#root = root;
        this.#authService = authService;
        this.#dashboardUrl = new URL("../../index.html", import.meta.url).href;
        this.#locationUrl = new URL("../../../Lokasi/index.html", import.meta.url).href;
        this.#marketplaceUrl = new URL("../../../Marketplace/index.html", import.meta.url).href;
        this.#loginUrl = new URL("../page/login.html", import.meta.url).href;
        this.#registerUrl = new URL("../page/register.html", import.meta.url).href;
    }

    /** Loads the current session and renders the correct navigation state. */
    async init() {
        this.#configureNavigation();
        let user = null;
        try {
            user = await this.#authService.getCurrentUser();
        } catch (error) {
            console.error("Tidak dapat memuat sesi LetCycle:", error);
        }

        this.#root.replaceChildren();
        if (user) {
            this.#renderSignedIn(user);
        } else {
            this.#renderGuest();
        }
    }

    #configureNavigation() {
        const brand = document.querySelector(".site-header .brand");
        if (brand) brand.href = this.#dashboardUrl;

        const links = document.querySelectorAll(".site-header .main-nav .nav-link");
        const destinations = [
            { label: "Home", href: this.#dashboardUrl },
            { label: "Lokasi Penukaran", href: this.#locationUrl },
            { label: "Marketplace", href: this.#marketplaceUrl },
        ];
        const currentPath = window.location.pathname.toLowerCase();
        let activeIndex = -1;
        if (currentPath.includes("/lokasi/")) {
            activeIndex = 1;
        } else if (currentPath.includes("/marketplace/")) {
            activeIndex = 2;
        } else if (currentPath.endsWith("/dashboard/index.html") || currentPath === "/") {
            activeIndex = 0;
        }

        links.forEach((link, index) => {
            const destination = destinations[index];
            if (!destination) return;
            link.href = destination.href;
            link.textContent = destination.label;
            if (index === activeIndex) {
                link.setAttribute("aria-current", "page");
            } else {
                link.removeAttribute("aria-current");
            }
        });
    }

    #renderGuest() {
        delete this.#root.dataset.signedIn;
        this.#root.append(
            this.#createLink(this.#loginUrl, "Masuk", "login-link text-white hover:opacity-[0.84]"),
            this.#createLink(
                this.#registerUrl,
                "Daftar",
                "inline-flex min-h-10 items-center justify-center rounded-[999px] bg-white px-[21px] text-deep hover:opacity-[0.84] mobile:min-h-8 mobile:px-[11px] tiny:min-h-[29px] tiny:px-2",
            ),
        );
    }

    #renderSignedIn(user) {
        this.#root.dataset.signedIn = "true";
        const name = this.#createElement("span", "profile-name max-w-[150px] truncate text-white mobile:hidden", user.nama);
        const divider = this.#createElement("span", "h-7 w-px bg-white/50 mobile:hidden");
        divider.setAttribute("aria-hidden", "true");
        const initials = user.nama
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part.charAt(0))
            .join("")
            .toUpperCase();
        const avatar = this.#createElement(
            "button",
            "profile-avatar grid h-10 w-10 cursor-pointer place-items-center rounded-full border-2 border-white/90 bg-[linear-gradient(140deg,#F7B267,#E76F51)] p-0 text-[13px] font-extrabold text-[#4A2B20] shadow-[0_3px_10px_rgba(38,50,56,0.18)] hover:-translate-y-px mobile:h-[34px] mobile:w-[34px] mobile:text-[11px]",
            initials || "LC",
        );
        avatar.type = "button";
        avatar.setAttribute("aria-label", `Menu pengguna ${user.nama}`);
        avatar.setAttribute("aria-expanded", "false");
        avatar.setAttribute("aria-haspopup", "true");

        const dropdown = this.#createElement(
            "div",
            "absolute right-0 top-[calc(100%+12px)] z-30 grid w-[min(290px,calc(100vw-32px))] gap-[7px] rounded-[15px] border border-line bg-white p-[19px] text-ink shadow-[0_16px_36px_rgba(38,50,56,0.18)] [&[hidden]]:hidden",
        );
        dropdown.hidden = true;
        const dropdownName = this.#createElement("strong", "text-[15px] text-ink [overflow-wrap:anywhere]", user.nama);
        const dropdownEmail = this.#createElement("span", "text-[12px] text-muted [overflow-wrap:anywhere]", user.email);
        const logoutMessage = this.#createElement("p", "text-[11px] text-[#A94442]");
        logoutMessage.setAttribute("aria-live", "polite");
        const logout = this.#createElement(
            "button",
            "profile-logout mt-2 min-h-[38px] cursor-pointer rounded-[9px] bg-[#F9E9E7] text-[13px] font-bold text-[#8F342F] hover:bg-[#F3D6D2]",
            "Keluar",
        );
        logout.type = "button";
        logout.addEventListener("click", async () => {
            logout.disabled = true;
            logout.textContent = "Memproses...";
            logoutMessage.textContent = "";
            try {
                await this.#authService.logout();
                window.location.assign(this.#dashboardUrl);
            } catch (error) {
                logout.disabled = false;
                logout.textContent = "Keluar";
                logoutMessage.textContent = error.message;
            }
        });

        dropdown.append(dropdownName, dropdownEmail, logoutMessage, logout);
        avatar.addEventListener("click", () => {
            dropdown.hidden = !dropdown.hidden;
            avatar.setAttribute("aria-expanded", String(!dropdown.hidden));
        });
        document.addEventListener("click", (event) => {
            if (!this.#root.contains(event.target)) {
                dropdown.hidden = true;
                avatar.setAttribute("aria-expanded", "false");
            }
        });

        this.#root.append(name, divider, avatar, dropdown);
    }

    #createLink(href, label, className) {
        const link = this.#createElement("a", className, label);
        link.href = href;
        return link;
    }

    #createElement(tagName, className, text = "") {
        const element = document.createElement(tagName);
        element.className = className;
        element.textContent = text;
        return element;
    }
}

const navbarRoot = document.querySelector("[data-navbar-auth]");
if (navbarRoot) new NavbarComponent(navbarRoot).init();
