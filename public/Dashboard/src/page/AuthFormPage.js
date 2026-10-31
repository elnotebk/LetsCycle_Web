import { FormValidator } from "../validators/FormValidator.js";

/** Shares form handling between the login and registration pages. */
export class AuthFormPage {
    #form;
    #submitButton;
    #status;

    /** Creates a controller for an authentication form. */
    constructor(form, authService) {
        if (new.target === AuthFormPage) {
            throw new TypeError("AuthFormPage harus diturunkan oleh halaman tertentu.");
        }
        this.#form = form;
        this.authService = authService;
        this.#submitButton = form.querySelector('[type="submit"]');
        this.#status = document.querySelector("[data-form-status]");
    }

    /** The form this page controls. */
    get form() {
        return this.#form;
    }

    /** Text shown on the idle submit button. */
    get submitLabel() {
        throw new Error("submitLabel belum diimplementasikan.");
    }

    /** Returns normalized values and errors for the submitted form. */
    validate(_formData) {
        throw new Error("validate belum diimplementasikan.");
    }

    /** Sends validated values to the server. */
    async submit(_values) {
        throw new Error("submit belum diimplementasikan.");
    }

    /** Moves on after the server accepts the form. */
    onSuccess(_result) {
        throw new Error("onSuccess belum diimplementasikan.");
    }

    /** Shows why the server rejected the form. */
    onError(error) {
        this.setStatus(error.message, "error");
    }

    /** Binds form submission and password visibility. */
    init() {
        this.#form.addEventListener("submit", (event) => this.#handleSubmit(event));
        this.#form.querySelectorAll("[data-toggle-password]").forEach((button) => {
            button.addEventListener("click", () => this.#togglePassword(button));
        });
    }

    /** Shows a form-level message. */
    setStatus(message, type = "") {
        this.#status.textContent = message;
        this.#status.dataset.state = type;
    }

    async #handleSubmit(event) {
        event.preventDefault();
        this.setStatus("");
        const { values, errors } = this.validate(new FormData(this.#form));
        FormValidator.renderErrors(this.#form, errors);
        if (Object.keys(errors).length) return;

        this.#setProcessing(true);
        try {
            await this.onSuccess(await this.submit(values));
        } catch (error) {
            this.onError(error);
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
        this.#submitButton.textContent = isProcessing ? "Memproses..." : this.submitLabel;
    }
}
