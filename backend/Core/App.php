<?php

declare(strict_types=1);

namespace LetCycle\Core;

use LetCycle\Controllers\AuthController;
use LetCycle\Controllers\LocationController;
use LetCycle\Repositories\FileLocationRepository;
use LetCycle\Repositories\FileUserRepository;
use LetCycle\Views\JsonView;

/** Applies request checks, wires dependencies, and routes API calls to controllers. */
final class App
{
    private readonly JsonView $view;

    public function __construct()
    {
        $this->view = new JsonView();
    }

    /** Handles the current API request, turning failures into JSON errors. */
    public function run(): void
    {
        try {
            $config = Config::fromEnvironment();
            $request = Request::fromGlobals();
            (new SecurityHeaders($config))->send();
            if (!$config->isAllowedHost($request->host)) {
                throw new ApiError(403, 'Host permintaan tidak diizinkan.');
            }
            $this->sendCorsHeaders($config, $request);

            if ($request->method === 'OPTIONS') {
                http_response_code(204);
                return;
            }
            $this->createRouter($config, $request)->dispatch($request);
        } catch (ApiError $error) {
            $this->view->error($error->status, $error->getMessage(), $error->headers);
        } catch (\Throwable $error) {
            error_log("Kesalahan server LetCycle: {$error}");
            $this->view->error(500, 'Terjadi kesalahan pada server.');
        }
    }

    /** Allows browser requests only from configured origins. */
    private function sendCorsHeaders(Config $config, Request $request): void
    {
        $origin = $request->origin;
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

    /** This is the one place that picks concrete classes; swap repositories here. */
    private function createRouter(Config $config, Request $request): Router
    {
        $data = $config->dataDirectory;
        $auth = fn (): AuthController => new AuthController(
            $request,
            $this->view,
            $config,
            new FileUserRepository($data),
            new PasswordHasher(),
            new Session($config),
            new RateLimiter("{$data}/rate-limits/login-email.json", 10, 15 * 60),
            new RateLimiter("{$data}/rate-limits/login-address.json", 100, 15 * 60),
            new RateLimiter("{$data}/rate-limits/register.json", 20, 60 * 60),
        );
        $locations = fn (): LocationController => new LocationController(
            $request,
            $this->view,
            new FileLocationRepository($data),
        );

        $router = new Router();
        $router->add('POST', '/api/test/register', static fn () => $auth()->register());
        $router->add('POST', '/api/test/login', static fn () => $auth()->login());
        $router->add('POST', '/api/test/logout', static fn () => $auth()->logout());
        $router->add('GET', '/api/test/me', static fn () => $auth()->me());
        $router->add('GET', '/api/locations', static fn () => $locations()->list());
        $router->add('GET', '/api/locations/cities', static fn () => $locations()->listCities());
        return $router;
    }
}
