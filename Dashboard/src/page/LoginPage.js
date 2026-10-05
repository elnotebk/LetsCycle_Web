import { AuthService } from "../services/AuthService.js";
import { FormValidator } from "../validators/FormValidator.js";

/** Handles the LetCycle login page form and user feedback. */
export class LoginPage {
    #form;
    #authService;
    #submitButton;
    #status;

    /** Creates a login page controller for the authentication form. */
    constructor(form, authService = new AuthService()) {
        this.#form = form;
        this.#authService = authService;
        this.#submitButton = form.querySelector('[type="submit"]');
        this.#status = document.querySelector("[data-form-status]");
    }

    /** Binds login, password visibility, and registration notice behavior. */
    init() {
        this.#form.addEventListener("submit", (event) => this.#handleSubmit(event));
        this.#form.querySelectorAll("[data-toggle-password]").forEach((button) => {
            button.addEventListener("click", () => this.#togglePassword(button));
        });
        if (new URLSearchParams(window.location.search).get("registered") === "1") {
            this.#setStatus("Pendaftaran berhasil, silakan masuk.", "success");
        }
    }

    async #handleSubmit(event) {
        event.preventDefault();
        this.#setStatus("");
        const { values, errors } = FormValidator.validateLogin(new FormData(this.#form));
        FormValidator.renderErrors(this.#form, errors);
        if (Object.keys(errors).length) return;

        this.#setProcessing(true);
        try {
            await this.#authService.login(values);
            window.location.assign(new URL("../../index.html", import.meta.url).href);
        } catch (error) {
            this.#setStatus(error.message, "error");
        } finally {
            this.#setProcessing(false);
        }
    }

    #togglePassword(button) {
        const input = document.getElementById(button.dataset.togglePassword);
        const showing = input.type === "password";
        input.type = showing ? "text" : "password";
        button.setAttribute("aria-label", showing ? "Sembunyikan password" : "Tampilkan password");
        button.textContent = showing ? "Sembunyikan" : "Tampilkan";
    }

    #setProcessing(isProcessing) {
        this.#submitButton.disabled = isProcessing;
        this.#submitButton.textContent = isProcessing ? "Memproses..." : "Masuk";
    }

    #setStatus(message, type = "") {
        this.#status.textContent = message;
        this.#status.className = `form-status${type ? ` is-${type}` : ""}`;
    }
}

const loginForm = document.querySelector("#login-form");
if (loginForm) new LoginPage(loginForm).init();
