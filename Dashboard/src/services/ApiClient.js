/** Wraps same-origin JSON requests to the local frontend test server. */
export class ApiClient {
    /** Creates an API client with an optional base URL. */
    constructor(baseUrl = "/api/test") {
        this.baseUrl = baseUrl.replace(/\/$/, "");
    }

    /** Sends a GET request and returns its decoded JSON response. */
    get(path) {
        return this.#request(path, { method: "GET" });
    }

    /** Sends a JSON POST request and returns its decoded JSON response. */
    post(path, payload = {}) {
        return this.#request(path, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
    }

    async #request(path, options) {
        let response;
        try {
            response = await fetch(`${this.baseUrl}${path}`, {
                ...options,
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    ...options.headers,
                },
            });
        } catch {
            throw new Error("Tidak dapat terhubung ke server. Periksa koneksi lalu coba lagi.");
        }

        let result;
        try {
            result = await response.json();
        } catch {
            throw new Error(
                "Server tidak mengenali endpoint uji frontend. Hentikan server lama, lalu jalankan npm start kembali.",
            );
        }

        if (!response.ok || result.ok !== true) {
            const error = new Error(result.pesan || "Permintaan tidak dapat diproses.");
            error.status = response.status;
            throw error;
        }
        return result;
    }
}
