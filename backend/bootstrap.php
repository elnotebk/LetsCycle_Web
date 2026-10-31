<?php

declare(strict_types=1);

ini_set('display_errors', '0');

spl_autoload_register(static function (string $class): void {
    $prefix = 'LetCycle\\';
    if (str_starts_with($class, $prefix)) {
        require __DIR__ . '/' . str_replace('\\', '/', substr($class, strlen($prefix))) . '.php';
    }
});
