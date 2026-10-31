<?php

// Development router for `php -S`. On Apache, public/.htaccess does this job.

declare(strict_types=1);

require __DIR__ . '/backend/bootstrap.php';

use LetCycle\Core\App;
use LetCycle\Core\Config;
use LetCycle\Core\Request;
use LetCycle\Core\SecurityHeaders;

$contentTypes = [
    'css' => 'text/css; charset=utf-8',
    'gif' => 'image/gif',
    'html' => 'text/html; charset=utf-8',
    'jpg' => 'image/jpeg',
    'js' => 'text/javascript; charset=utf-8',
    'png' => 'image/png',
    'svg' => 'image/svg+xml',
    'webp' => 'image/webp',
];

$request = Request::fromGlobals();
$path = rawurldecode($request->path);
if ($path === '/api' || str_starts_with($path, '/api/')) {
    (new App())->run();
    return;
}

$config = Config::fromEnvironment();
(new SecurityHeaders($config))->send();
if (!$config->isAllowedHost($request->host)) {
    http_response_code(403);
    return;
}
if ($path === '/') {
    header('Location: /Dashboard/index.html', true, 302);
    return;
}

$root = __DIR__ . DIRECTORY_SEPARATOR . 'public' . DIRECTORY_SEPARATOR;
$segments = array_values(array_filter(preg_split('~[\\\\/]+~', $path)));
$isSafe = array_reduce($segments, static fn (bool $safe, string $segment): bool => $safe && preg_match('/^[\w-]+(?:\.[\w-]+)*$/', $segment) === 1, true);
$file = $isSafe ? realpath($root . implode(DIRECTORY_SEPARATOR, $segments)) : false;
$contentType = $contentTypes[strtolower(pathinfo($path, PATHINFO_EXTENSION))] ?? null;

if (!$isSafe || $file === false || $contentType === null || !is_file($file) || !str_starts_with($file, $root)) {
    http_response_code(404);
    echo 'Not found';
    return;
}

header("Content-Type: {$contentType}");
header('Cache-Control: no-store');
readfile($file);
