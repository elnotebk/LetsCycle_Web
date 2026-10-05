/** Validates authentication form fields in the browser. */
export class FormValidator {
    /** Validates registration fields and returns normalized values and errors. */
    static validateRegistration(formData) {
        const nama = String(formData.get("nama") || "").trim();
        const email = String(formData.get("email") || "").trim().toLowerCase();
        const password = String(formData.get("password") || "").trim();
        const konfirmasiPassword = String(formData.get("konfirmasiPassword") || "").trim();
        const errors = {};

        if (nama.length < 2 || nama.length > 60) {
            errors.nama = "Nama harus terdiri dari 2–60 karakter.";
        }
        if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = "Masukkan alamat email yang valid.";
        }
        if (password.length < 8 || password.length > 128) {
            errors.password = "Password harus terdiri dari 8–128 karakter.";
        }
        if (konfirmasiPassword !== password) {
            errors.konfirmasiPassword = "Konfirmasi password tidak cocok.";
        }

        return {
            values: { nama, email, password, konfirmasiPassword },
            errors,
        };
    }

    /** Validates login fields and returns normalized values and errors. */
    static validateLogin(formData) {
        const email = String(formData.get("email") || "").trim().toLowerCase();
        const password = String(formData.get("password") || "").trim();
        const errors = {};

        if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = "Masukkan alamat email yang valid.";
        }
        if (password.length < 1 || password.length > 128) {
            errors.password = "Password harus diisi dan maksimal 128 karakter.";
        }

        return { values: { email, password }, errors };
    }

    /** Displays field errors and marks invalid controls accessibly. */
    static renderErrors(form, errors) {
        form.querySelectorAll("[data-field-error]").forEach((message) => {
            message.textContent = errors[message.dataset.fieldError] || "";
        });
        form.querySelectorAll("[name]").forEach((field) => {
            const invalid = Boolean(errors[field.name]);
            field.setAttribute("aria-invalid", String(invalid));
            if (invalid) {
                field.setAttribute("aria-describedby", `${field.id}-error`);
            } else {
                field.removeAttribute("aria-describedby");
            }
        });
    }
}
