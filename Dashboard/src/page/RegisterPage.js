import { AuthService } from "../services/AuthService.js";
import { FormValidator } from "../validators/FormValidator.js";

/** Handles the LetCycle registration page form and user feedback. */
export class RegisterPage {
    #form;
    #authService;
    #submitButton;
    #status;

    /** Creates a registration page controller for the account form. */
    constructor(form, authService = new AuthService()) {
        this.#form = form;
        this.#authService = authService;
        this.#submitButton = form.querySelector('[type="submit"]');
        this.#status = document.querySelector("[data-form-status]");
    }

    /** Binds registration, password visibility, and live field validation. */
    init() {
        this.#form.addEventListener("submit", (event) => this.#handleSubmit(event));
        this.#form.querySelectorAll("[data-toggle-password]").forEach((button) => {
            button.addEventListener("click", () => this.#togglePassword(button));
        });
        this.#form.querySelectorAll("[name]").forEach((field) => {
            field.addEventListener("input", () => {
                const { errors } = FormValidator.validateRegistration(new FormData(this.#form));
                FormValidator.renderErrors(this.#form, errors);
            });
        });
    }

    async #handleSubmit(event) {
        event.preventDefault();
        this.#setStatus("");
        const { values, errors } = FormValidator.validateRegistration(new FormData(this.#form));
        FormValidator.renderErrors(this.#form, errors);
        if (Object.keys(errors).length) return;

        this.#setProcessing(true);
        try {
            await this.#authService.register(values);
            window.location.assign(new URL("login.html?registered=1", import.meta.url).href);
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
        this.#submitButton.textContent = isProcessing ? "Memproses..." : "Daftar";
    }

    #setStatus(message, type = "") {
        this.#status.textContent = message;
        this.#status.className = `form-status${type ? ` is-${type}` : ""}`;
    }
}

const registerForm = document.querySelector("#register-form");
if (registerForm) new RegisterPage(registerForm).init();
