<?php

declare(strict_types=1);

namespace LetCycle;

/** Handles account registration, login, logout, and the current user. */
final class AuthController
{
    private readonly string|int $hashAlgorithm;

    public function __construct(
        private readonly Config $config,
        private readonly UserRepository $users,
        private readonly Session $session,
        private readonly RateLimiter $emailLoginLimiter,
        private readonly RateLimiter $addressLoginLimiter,
        private readonly RateLimiter $registerLimiter,
    ) {
        $this->hashAlgorithm = defined('PASSWORD_ARGON2ID') ? PASSWORD_ARGON2ID : PASSWORD_DEFAULT;
    }

    /** Validates and stores a new account with a salted password hash. */
    public function register(): void
    {
        $input = Http::readJson();
        $nama = is_string($input->nama ?? null) ? trim($input->nama) : '';
        $email = is_string($input->email ?? null) ? mb_strtolower(trim($input->email)) : '';
        $password = is_string($input->password ?? null) ? $input->password : '';

        if (mb_strlen($nama) < 2 || mb_strlen($nama) > 60
            || mb_strlen($email) > 254 || !preg_match('/^[^\s@]+@[^\s@]+\.[^\s@]+$/u', $email)
            || mb_strlen($password) < 8 || mb_strlen($password) > 128) {
            Http::json(400, ['ok' => false, 'pesan' => 'Data pendaftaran tidak valid.']);
            return;
        }

        if (!$this->registerLimiter->attempt(Http::clientAddress($this->config))) {
            Http::json(429, ['ok' => false, 'pesan' => 'Terlalu banyak pendaftaran. Coba lagi nanti.']);
            return;
        }

        $user = $this->users->create($nama, $email, password_hash($password, $this->hashAlgorithm));
        if ($user === null) {
            Http::json(409, ['ok' => false, 'pesan' => 'Email tersebut sudah terdaftar untuk uji coba.']);
            return;
        }
        Http::json(201, ['ok' => true, 'user' => self::toPublicUser($user)]);
    }

    /** Verifies credentials, starts a session, and returns the public profile. */
    public function login(): void
    {
        $input = Http::readJson();
        $email = is_string($input->email ?? null) ? mb_strtolower(trim($input->email)) : '';
        $password = is_string($input->password ?? null) ? $input->password : '';

        if (!$this->emailLoginLimiter->attempt($email)
            || !$this->addressLoginLimiter->attempt(Http::clientAddress($this->config))) {
            Http::json(429, ['ok' => false, 'pesan' => 'Terlalu banyak percobaan masuk. Coba lagi nanti.']);
            return;
        }

        $user = $this->users->findByEmail($email);
        $passwordMatches = $this->passwordMatches($password, $user);
        if ($user === null || !$passwordMatches) {
            Http::json(401, ['ok' => false, 'pesan' => 'Email atau password salah.']);
            return;
        }

        $this->emailLoginLimiter->reset($email);
        $this->session->login($user['id']);
        Http::json(200, ['ok' => true, 'user' => self::toPublicUser($user)]);
    }

    /** Ends the current session. */
    public function logout(): void
    {
        $this->session->logout();
        Http::json(200, ['ok' => true]);
    }

    /** Returns the signed-in account, or a null user for guests. */
    public function me(): void
    {
        $userId = $this->session->userId();
        $user = $userId === null ? null : $this->users->findById($userId);
        Http::json(200, ['ok' => true, 'user' => $user === null ? null : self::toPublicUser($user)]);
    }

    /** Hashes anyway when there is nothing to verify, so timing hides whether an email exists. */
    private function passwordMatches(string $password, ?array $user): bool
    {
        $hash = $user['passwordHash'] ?? '';
        if (password_get_info($hash)['algo'] === null) {
            password_hash($password, $this->hashAlgorithm);
            return false;
        }
        return password_verify($password, $hash);
    }

    private static function toPublicUser(array $user): array
    {
        unset($user['passwordHash']);
        return $user;
    }
}
