import { User } from "../models/User.js";
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
        return User.fromJSON(result.user);
    }

    /** Signs into a test account; the server keeps the session in a cookie. */
    async login(credentials) {
        const result = await this.apiClient.post("/login", credentials);
        return User.fromJSON(result.user);
    }

    /** Ends the server session. */
    async logout() {
        await this.apiClient.post("/logout");
    }

    /** Returns the signed-in user, or null when signed out. */
    async getCurrentUser() {
        const result = await this.apiClient.get("/me");
        return result.user === null ? null : User.fromJSON(result.user);
    }
}
