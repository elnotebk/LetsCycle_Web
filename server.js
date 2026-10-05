import { createServer } from "node:http";
import { appendFile, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { promisify } from "node:util";
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scrypt = promisify(scryptCallback);
const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const dataDirectory = path.join(projectRoot, "data");
const usersFile = path.join(dataDirectory, "users.txt");
const port = Number(process.env.PORT) || 3000;
const maximumBodySize = 8 * 1024;
const apiPaths = new Set(["/api/test/register", "/api/test/login"]);
const contentTypes = new Map([
    [".css", "text/css; charset=utf-8"],
    [".gif", "image/gif"],
    [".html", "text/html; charset=utf-8"],
    [".ico", "image/x-icon"],
    [".jpeg", "image/jpeg"],
    [".jpg", "image/jpeg"],
    [".js", "text/javascript; charset=utf-8"],
    [".json", "application/json; charset=utf-8"],
    [".png", "image/png"],
    [".svg", "image/svg+xml"],
    [".webp", "image/webp"],
    [".woff", "font/woff"],
    [".woff2", "font/woff2"],
]);

let writeQueue = Promise.resolve();

/** Derives a salted password hash for local account testing. */
async function hashPassword(password) {
    const salt = randomBytes(16).toString("hex");
    const hash = await scrypt(password, salt, 64);
    return `${salt}:${hash.toString("hex")}`;
}

/** Compares a password to its saved salted hash without timing leaks. */
async function verifyPassword(password, storedHash) {
    if (typeof storedHash !== "string") return false;
    const [salt, savedHash] = storedHash.split(":");
    if (!/^[\da-f]{32}$/i.test(salt || "") || !/^[\da-f]{128}$/i.test(savedHash || "")) {
        return false;
    }

    const derivedHash = await scrypt(password, salt, 64);
    const savedBuffer = Buffer.from(savedHash, "hex");
    return timingSafeEqual(derivedHash, savedBuffer);
}

/** Sends a JSON response using a consistent shape for the test UI. */
function sendJson(response, statusCode, payload) {
    response.writeHead(statusCode, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
    });
    response.end(JSON.stringify(payload));
}

/** Allows browser requests only from local HTTP development servers. */
function setLocalCorsHeaders(request, response) {
    const origin = request.headers.origin;
    if (!origin) return true;

    let parsedOrigin;
    try {
        parsedOrigin = new URL(origin);
    } catch {
        return false;
    }

    if (parsedOrigin.protocol !== "http:" ||
        !["localhost", "127.0.0.1", "[::1]"].includes(parsedOrigin.hostname)) {
        return false;
    }

    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "Accept, Content-Type");
    response.setHeader("Access-Control-Max-Age", "600");
    response.setHeader("Vary", "Origin");
    return true;
}

/** Reads a small JSON request body and rejects oversized or invalid payloads. */
async function readJson(request) {
    let body = "";
    for await (const chunk of request) {
        body += chunk;
        if (Buffer.byteLength(body) > maximumBodySize) {
            const error = new Error("Ukuran data terlalu besar.");
            error.statusCode = 413;
            throw error;
        }
    }

    try {
        return JSON.parse(body);
    } catch {
        const error = new Error("Format data tidak valid.");
        error.statusCode = 400;
        throw error;
    }
}

/** Reads JSON-lines test accounts, treating an absent file as an empty store. */
async function readUsers() {
    try {
        const contents = await readFile(usersFile, "utf8");
        return contents.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
    } catch (error) {
        if (error.code === "ENOENT") return [];
        throw error;
    }
}

/** Replaces the users file atomically when upgrading a legacy test account. */
async function replaceUsers(users) {
    const temporaryFile = `${usersFile}.${randomBytes(8).toString("hex")}.tmp`;
    await writeFile(temporaryFile, users.map((user) => JSON.stringify(user)).join("\n") + "\n", "utf8");
    await rename(temporaryFile, usersFile);
}

/** Removes password hashes before account data is returned to the browser. */
function toPublicUser(user) {
    const { passwordHash, ...publicUser } = user;
    return publicUser;
}

/** Serializes account writes so simultaneous test registrations do not collide. */
function serializeWrite(operation) {
    const result = writeQueue.then(operation);
    writeQueue = result.catch(() => {});
    return result;
}

/** Validates and stores test-account details with a salted password hash. */
async function registerTestUser(request, response) {
    const input = await readJson(request);
    const nama = typeof input.nama === "string" ? input.nama.trim() : "";
    const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
    const password = typeof input.password === "string" ? input.password : "";

    if (nama.length < 2 || nama.length > 60 ||
        email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        password.length < 8 || password.length > 128) {
        sendJson(response, 400, { ok: false, pesan: "Data pendaftaran tidak valid." });
        return;
    }

    const passwordHash = await hashPassword(password);
    const user = await serializeWrite(async () => {
        const users = await readUsers();
        const existingIndex = users.findIndex((existingUser) => existingUser.email === email);
        if (existingIndex >= 0) {
            const existingUser = users[existingIndex];
            if (existingUser.passwordHash) return null;

            const upgradedUser = {
                ...existingUser,
                nama,
                passwordHash,
            };
            users[existingIndex] = upgradedUser;
            await replaceUsers(users);
            return upgradedUser;
        }

        const newUser = {
            id: users.reduce((highestId, existingUser) => Math.max(highestId, existingUser.id), 0) + 1,
            nama,
            email,
            passwordHash,
            dibuat: new Date().toISOString(),
        };
        await mkdir(dataDirectory, { recursive: true });
        await appendFile(usersFile, `${JSON.stringify(newUser)}\n`, "utf8");
        return newUser;
    });

    if (!user) {
        sendJson(response, 409, { ok: false, pesan: "Email tersebut sudah terdaftar untuk uji coba." });
        return;
    }
    sendJson(response, 201, { ok: true, user: toPublicUser(user) });
}

/** Verifies test credentials and returns the public account profile. */
async function loginTestUser(request, response) {
    const input = await readJson(request);
    const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
    const password = typeof input.password === "string" ? input.password : "";
    const user = (await readUsers()).find((existingUser) => existingUser.email === email);

    if (!user || !await verifyPassword(password, user.passwordHash)) {
        sendJson(response, 401, {
            ok: false,
            pesan: "Email atau password salah. Jika akun dibuat sebelum pembaruan ini, daftar ulang dengan email yang sama untuk mengatur password.",
        });
        return;
    }
    sendJson(response, 200, { ok: true, user: toPublicUser(user) });
}

/** Serves project assets without exposing local data or development files. */
async function serveStatic(request, response, pathname) {
    const decodedPath = decodeURIComponent(pathname);
    const segments = decodedPath.split(/[\\/]+/).filter(Boolean);
    const blockedNames = new Set([".git", "data", "node_modules", "server"]);
    if (segments.some((segment) =>
        blockedNames.has(segment.toLowerCase()) ||
        ["package.json", "package-lock.json", "server.js"].includes(segment.toLowerCase()))) {
        response.writeHead(404);
        response.end("Not found");
        return;
    }

    const relativePath = segments.length ? segments.join(path.sep) : "Dashboard/index.html";
    const filePath = path.resolve(projectRoot, relativePath);
    if (!filePath.startsWith(`${projectRoot}${path.sep}`)) {
        response.writeHead(404);
        response.end("Not found");
        return;
    }

    try {
        const contents = await readFile(filePath);
        response.writeHead(200, {
            "Content-Type": contentTypes.get(path.extname(filePath).toLowerCase()) || "application/octet-stream",
            "Cache-Control": "no-store",
        });
        response.end(contents);
    } catch (error) {
        if (error.code === "ENOENT" || error.code === "EISDIR") {
            response.writeHead(404);
            response.end("Not found");
            return;
        }
        throw error;
    }
}

/** Routes local test submissions and serves the dashboard on loopback only. */
const server = createServer(async (request, response) => {
    try {
        const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
        if (apiPaths.has(url.pathname)) {
            if (!setLocalCorsHeaders(request, response)) {
                sendJson(response, 403, { ok: false, pesan: "Asal permintaan tidak diizinkan." });
                return;
            }
            if (request.method === "OPTIONS") {
                response.writeHead(204);
                response.end();
                return;
            }
        }
        if (request.method === "POST" && url.pathname === "/api/test/register") {
            await registerTestUser(request, response);
            return;
        }
        if (request.method === "POST" && url.pathname === "/api/test/login") {
            await loginTestUser(request, response);
            return;
        }
        if (request.method !== "GET" && request.method !== "HEAD") {
            sendJson(response, 404, { ok: false, pesan: "Halaman tidak ditemukan." });
            return;
        }
        await serveStatic(request, response, url.pathname);
    } catch (error) {
        if (error.statusCode) {
            sendJson(response, error.statusCode, { ok: false, pesan: error.message });
            return;
        }
        console.error("Kesalahan server uji lokal:", error);
        sendJson(response, 500, { ok: false, pesan: "Terjadi kesalahan pada server uji lokal." });
    }
});

server.listen(port, "127.0.0.1", () => {
    console.log(`Server uji lokal LetCycle berjalan di http://127.0.0.1:${port}`);
});
