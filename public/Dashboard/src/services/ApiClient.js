/** Reaches the API on port 3000 when the frontend runs on VS Code Live Server. */
export function getApiOrigin() {
    const { hostname, origin, port } = window.location;
    return ["5500", "5501"].includes(port) ? `http://${hostname}:3000` : origin;
}

/** Wraps JSON requests to the LetCycle API server. */
export class ApiClient {
    /** Creates an API client with an optional base URL. */
    constructor(baseUrl = `${getApiOrigin()}/api/test`) {
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
            throw new Error("Tidak dapat terhubung ke server API. Pastikan server LetCycle aktif dengan menjalankan npm start.");
        }

        let result;
        try {
            result = await response.json();
        } catch {
            throw new Error(
                "Server API mengirim respons yang tidak valid. Pastikan npm start dijalankan dari folder proyek LetCycle.",
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
