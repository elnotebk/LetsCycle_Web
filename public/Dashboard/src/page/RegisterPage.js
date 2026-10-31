import { AuthService } from "../services/AuthService.js";
import { FormValidator } from "../validators/FormValidator.js";
import { AuthFormPage } from "./AuthFormPage.js";

/** Handles the LetCycle registration page form and user feedback. */
export class RegisterPage extends AuthFormPage {
    /** Creates a registration page controller for the account form. */
    constructor(form, authService = new AuthService()) {
        super(form, authService);
    }

    get submitLabel() {
        return "Daftar";
    }

    /** Binds the form and validates fields as they change. */
    init() {
        super.init();
        this.form.querySelectorAll("[name]").forEach((field) => {
            field.addEventListener("input", () => {
                const { errors } = this.validate(new FormData(this.form));
                FormValidator.renderErrors(this.form, errors);
            });
        });
    }

    validate(formData) {
        return FormValidator.validateRegistration(formData);
    }

    submit(values) {
        return this.authService.register(values);
    }

    onSuccess() {
        window.location.assign(new URL("login.html?registered=1", import.meta.url).href);
    }
}

const registerForm = document.querySelector("#register-form");
if (registerForm) new RegisterPage(registerForm).init();
