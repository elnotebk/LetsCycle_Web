import { ApiClient } from "./ApiClient.js";

/** Provides browser-side account flows for local frontend testing. */
export class AuthService {
    /** Creates a test auth service backed by the local data endpoint. */
    constructor(apiClient = new ApiClient()) {
        this.apiClient = apiClient;
    }

    /** Registers test account details; the server stores only a password hash. */
    async register(details) {
        const result = await this.apiClient.post("/register", details);
        return result.user;
    }

    /** Signs into a test account using its registered password. */
    async login(credentials) {
        const result = await this.apiClient.post("/login", credentials);
        window.sessionStorage.setItem("letcycle-test-user", JSON.stringify(result.user));
        return result.user;
    }

    /** Ends the temporary browser session. */
    async logout() {
        window.sessionStorage.removeItem("letcycle-test-user");
    }

    /** Returns the current temporary user, or null when signed out. */
    async getCurrentUser() {
        try {
            const storedUser = window.sessionStorage.getItem("letcycle-test-user");
            return storedUser ? JSON.parse(storedUser) : null;
        } catch {
            window.sessionStorage.removeItem("letcycle-test-user");
            return null;
        }
    }
}
