import { AuthService } from "../services/AuthService.js";

/** Renders the reusable guest and signed-in navigation states. */
export class NavbarComponent {
    #root;
    #authService;
    #dashboardUrl;
    #loginUrl;
    #registerUrl;

    /** Creates a navbar for a container and authentication service. */
    constructor(root, authService = new AuthService()) {
        this.#root = root;
        this.#authService = authService;
        this.#dashboardUrl = new URL("../../index.html", import.meta.url).href;
        this.#loginUrl = new URL("../page/login.html", import.meta.url).href;
        this.#registerUrl = new URL("../page/register.html", import.meta.url).href;
    }

    /** Loads the current session and renders the correct navigation state. */
    async init() {
        this.#ensureStylesheet();
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

    #ensureStylesheet() {
        const stylesheetUrl = new URL("../css/navbar.css", import.meta.url).href;
        const alreadyLoaded = [...document.querySelectorAll('link[rel="stylesheet"]')]
            .some((stylesheet) => stylesheet.href === stylesheetUrl);
        if (alreadyLoaded) return;

        const stylesheet = document.createElement("link");
        stylesheet.rel = "stylesheet";
        stylesheet.href = stylesheetUrl;
        document.head.append(stylesheet);
    }

    #renderGuest() {
        this.#root.classList.remove("auth-actions-signed-in");
        this.#root.append(
            this.#createLink(this.#loginUrl, "Masuk", "login-link"),
            this.#createLink(this.#registerUrl, "Daftar", "register-link"),
        );
    }

    #renderSignedIn(user) {
        this.#root.classList.add("auth-actions-signed-in");
        const name = this.#createElement("span", "profile-name", user.nama);
        const divider = this.#createElement("span", "profile-divider");
        divider.setAttribute("aria-hidden", "true");
        const initials = user.nama
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part.charAt(0))
            .join("")
            .toUpperCase();
        const avatar = this.#createElement("button", "profile-avatar", initials || "LC");
        avatar.type = "button";
        avatar.setAttribute("aria-label", `Menu pengguna ${user.nama}`);
        avatar.setAttribute("aria-expanded", "false");
        avatar.setAttribute("aria-haspopup", "true");

        const dropdown = this.#createElement("div", "profile-dropdown");
        dropdown.hidden = true;
        const dropdownName = this.#createElement("strong", "profile-dropdown-name", user.nama);
        const dropdownEmail = this.#createElement("span", "profile-dropdown-email", user.email);
        const logoutMessage = this.#createElement("p", "profile-dropdown-message");
        logoutMessage.setAttribute("aria-live", "polite");
        const logout = this.#createElement("button", "profile-logout", "Keluar");
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
