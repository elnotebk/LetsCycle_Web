import { AuthService } from "../services/AuthService.js";
import { FormValidator } from "../validators/FormValidator.js";
import { AuthFormPage } from "./AuthFormPage.js";

/** Handles the LetCycle login page form and user feedback. */
export class LoginPage extends AuthFormPage {
    /** Creates a login page controller for the authentication form. */
    constructor(form, authService = new AuthService()) {
        super(form, authService);
    }

    get submitLabel() {
        return "Masuk";
    }

    /** Binds the form and shows the notice left by registration. */
    init() {
        super.init();
        if (new URLSearchParams(window.location.search).get("registered") === "1") {
            this.setStatus("Pendaftaran berhasil, silakan masuk.", "success");
        }
    }

    validate(formData) {
        return FormValidator.validateLogin(formData);
    }

    submit(values) {
        return this.authService.login(values);
    }

    onSuccess() {
        window.location.assign(new URL("../../index.html", import.meta.url).href);
    }
}

const loginForm = document.querySelector("#login-form");
if (loginForm) new LoginPage(loginForm).init();
