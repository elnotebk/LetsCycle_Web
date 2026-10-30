<?php

declare(strict_types=1);

ini_set('display_errors', '0');

foreach (['ApiError', 'Config', 'Http', 'RateLimiter', 'Session', 'UserRepository', 'LocationRepository', 'AuthController', 'LocationController', 'App'] as $class) {
    require __DIR__ . "/{$class}.php";
}
