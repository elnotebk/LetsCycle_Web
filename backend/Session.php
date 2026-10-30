<?php

declare(strict_types=1);

namespace LetCycle;

/** Wraps PHP sessions in a cookie that scripts and other sites cannot use. */
final class Session
{
    private const COOKIE_NAME = 'letcycle_session';
    private const DURATION_SECONDS = 8 * 60 * 60;

    public function __construct(private readonly Config $config)
    {
    }

    /** Returns the signed-in user id, or null for guests and expired sessions. */
    public function userId(): ?int
    {
        if (!isset($_COOKIE[self::COOKIE_NAME])) {
            return null;
        }

        $this->start();
        $userId = $_SESSION['userId'] ?? null;
        if ($userId === null || ($_SESSION['expiresAt'] ?? 0) <= time()) {
            $this->destroy();
            return null;
        }
        session_write_close();
        return $userId;
    }

    /** Starts a session under a new id so an old one cannot be reused. */
    public function login(int $userId): void
    {
        $this->start();
        session_regenerate_id(true);
        $_SESSION = ['userId' => $userId, 'expiresAt' => time() + self::DURATION_SECONDS];
        session_write_close();
    }

    /** Ends the current session and clears its cookie. */
    public function logout(): void
    {
        if (isset($_COOKIE[self::COOKIE_NAME])) {
            $this->start();
            $this->destroy();
        }
    }

    private function start(): void
    {
        $directory = "{$this->config->dataDirectory}/sessions";
        if (!is_dir($directory)) {
            mkdir($directory, 0700, true);
        }

        ini_set('session.use_strict_mode', '1');
        ini_set('session.use_only_cookies', '1');
        ini_set('session.gc_maxlifetime', (string) self::DURATION_SECONDS);
        session_save_path($directory);
        session_name(self::COOKIE_NAME);
        session_cache_limiter('');
        session_set_cookie_params($this->cookieOptions(self::DURATION_SECONDS));
        session_start();
    }

    private function destroy(): void
    {
        session_destroy();
        $options = $this->cookieOptions(0);
        unset($options['lifetime']);
        setcookie(self::COOKIE_NAME, '', ['expires' => time() - 3600] + $options);
    }

    private function cookieOptions(int $lifetime): array
    {
        return [
            'lifetime' => $lifetime,
            'path' => '/',
            'secure' => $this->config->production,
            'httponly' => true,
            'samesite' => 'Strict',
        ];
    }
}
