<?php

declare(strict_types=1);

namespace LetCycle\Core;

/** Maps exact request paths and methods to their handlers. */
final class Router
{
    /** @var array<string, array{method: string, handler: callable}> */
    private array $routes = [];

    /** Registers the handler for a path. */
    public function add(string $method, string $path, callable $handler): void
    {
        $this->routes[$path] = ['method' => $method, 'handler' => $handler];
    }

    /** Runs the matching handler, or fails with a 404 or 405 error. */
    public function dispatch(Request $request): void
    {
        $route = $this->routes[$request->path] ?? null;
        if ($route === null) {
            throw new ApiError(404, 'Alamat API tidak ditemukan.');
        }
        if ($request->method !== $route['method']) {
            throw new ApiError(405, 'Metode permintaan tidak diizinkan.', ['Allow' => $route['method']]);
        }
        ($route['handler'])();
    }
}
