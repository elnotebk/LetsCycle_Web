<?php

declare(strict_types=1);

namespace LetCycle;

/** Applies request checks and routes API calls to their controllers. */
final class App
{
    private const ROUTES = [
        '/api/test/register' => ['POST', 'register'],
        '/api/test/login' => ['POST', 'login'],
        '/api/test/logout' => ['POST', 'logout'],
        '/api/test/me' => ['GET', 'me'],
        '/api/locations' => ['GET', 'locations'],
        '/api/locations/cities' => ['GET', 'cities'],
    ];

    /** Handles the current API request, turning failures into JSON errors. */
    public static function run(): void
    {
        try {
            $config = Config::fromEnvironment();
            Http::sendSecurityHeaders($config);
            if (!$config->isAllowedHost($_SERVER['HTTP_HOST'] ?? '')) {
                throw new ApiError(403, 'Host permintaan tidak diizinkan.');
            }
            self::sendCorsHeaders($config);

            $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
            if ($method === 'OPTIONS') {
                http_response_code(204);
                return;
            }

            $route = self::ROUTES[parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH)] ?? null;
            if ($route === null) {
                throw new ApiError(404, 'Alamat API tidak ditemukan.');
            }
            if ($method !== $route[0]) {
                header("Allow: {$route[0]}");
                throw new ApiError(405, 'Metode permintaan tidak diizinkan.');
            }
            self::dispatch($route[1], $config);
        } catch (ApiError $error) {
            Http::json($error->status, ['ok' => false, 'pesan' => $error->getMessage()]);
        } catch (\Throwable $error) {
            error_log("Kesalahan server LetCycle: {$error}");
            Http::json(500, ['ok' => false, 'pesan' => 'Terjadi kesalahan pada server.']);
        }
    }

    /** Allows browser requests only from configured origins. */
    private static function sendCorsHeaders(Config $config): void
    {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? null;
        if ($origin === null) {
            return;
        }
        if (!$config->isAllowedOrigin($origin)) {
            throw new ApiError(403, 'Asal permintaan tidak diizinkan.');
        }

        header("Access-Control-Allow-Origin: {$origin}");
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Accept, Content-Type');
        header('Access-Control-Max-Age: 600');
        header('Vary: Origin');
    }

    private static function dispatch(string $action, Config $config): void
    {
        $data = $config->dataDirectory;
        if ($action === 'locations' || $action === 'cities') {
            $controller = new LocationController(new LocationRepository($data));
            $action === 'locations' ? $controller->list() : $controller->listCities();
            return;
        }

        $controller = new AuthController(
            $config,
            new UserRepository($data),
            new Session($config),
            new RateLimiter("{$data}/rate-limits/login-email.json", 10, 15 * 60),
            new RateLimiter("{$data}/rate-limits/login-address.json", 100, 15 * 60),
            new RateLimiter("{$data}/rate-limits/register.json", 20, 60 * 60),
        );
        $controller->{$action}();
    }
}
