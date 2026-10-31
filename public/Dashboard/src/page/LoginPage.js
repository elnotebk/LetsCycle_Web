import { AuthService } from "../services/AuthService.js";
import { FormValidator } from "../validators/FormValidator.js";
import { AuthFormPage } from "./AuthFormPage.js";

const SUCCESS_MESSAGE_MILLISECONDS = 1200;

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

    /** Confirms the login, then opens the dashboard once the message has been seen. */
    async onSuccess(user) {
        this.setStatus(`Berhasil masuk. Selamat datang, ${user.nama}!`, "success");
        await new Promise((resolve) => window.setTimeout(resolve, SUCCESS_MESSAGE_MILLISECONDS));
        window.location.assign(new URL("../../index.html", import.meta.url).href);
    }
}

const loginForm = document.querySelector("#login-form");
if (loginForm) new LoginPage(loginForm).init();
