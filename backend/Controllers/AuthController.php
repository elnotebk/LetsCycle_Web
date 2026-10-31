<?php

declare(strict_types=1);

namespace LetCycle\Controllers;

use LetCycle\Core\Config;
use LetCycle\Core\PasswordHasher;
use LetCycle\Core\RateLimiter;
use LetCycle\Core\Request;
use LetCycle\Core\Session;
use LetCycle\Models\User;
use LetCycle\Repositories\UserRepositoryInterface;
use LetCycle\Views\JsonView;

/** Handles account registration, login, logout, and the current user. */
final class AuthController extends Controller
{
    public function __construct(
        Request $request,
        JsonView $view,
        private readonly Config $config,
        private readonly UserRepositoryInterface $users,
        private readonly PasswordHasher $hasher,
        private readonly Session $session,
        private readonly RateLimiter $emailLoginLimiter,
        private readonly RateLimiter $addressLoginLimiter,
        private readonly RateLimiter $registerLimiter,
    ) {
        parent::__construct($request, $view);
    }

    /** Validates and stores a new account with a salted password hash. */
    public function register(): void
    {
        $input = $this->request->json();
        $nama = is_string($input->nama ?? null) ? trim($input->nama) : '';
        $email = is_string($input->email ?? null) ? User::normalizeEmail($input->email) : '';
        $password = is_string($input->password ?? null) ? $input->password : '';

        if (!User::isValidRegistration($nama, $email, $password)) {
            $this->view->error(400, 'Data pendaftaran tidak valid.');
            return;
        }

        if (!$this->registerLimiter->attempt($this->request->clientAddress($this->config))) {
            $this->view->error(429, 'Terlalu banyak pendaftaran. Coba lagi nanti.');
            return;
        }

        $user = $this->users->create($nama, $email, $this->hasher->hash($password));
        if ($user === null) {
            $this->view->error(409, 'Email tersebut sudah terdaftar untuk uji coba.');
            return;
        }
        $this->view->success(201, ['user' => $user]);
    }

    /** Verifies credentials, starts a session, and returns the public profile. */
    public function login(): void
    {
        $input = $this->request->json();
        $email = is_string($input->email ?? null) ? User::normalizeEmail($input->email) : '';
        $password = is_string($input->password ?? null) ? $input->password : '';

        if (!$this->emailLoginLimiter->attempt($email)
            || !$this->addressLoginLimiter->attempt($this->request->clientAddress($this->config))) {
            $this->view->error(429, 'Terlalu banyak percobaan masuk. Coba lagi nanti.');
            return;
        }

        $user = $this->users->findByEmail($email);
        if (!$this->hasher->verify($password, $user?->passwordHash) || $user === null) {
            $this->view->error(401, 'Email atau password salah.');
            return;
        }

        $this->emailLoginLimiter->reset($email);
        $this->session->login($user->id);
        $this->view->success(200, ['user' => $user]);
    }

    /** Ends the current session. */
    public function logout(): void
    {
        $this->session->logout();
        $this->view->success(200);
    }

    /** Returns the signed-in account, or a null user for guests. */
    public function me(): void
    {
        $userId = $this->session->userId();
        $this->view->success(200, ['user' => $userId === null ? null : $this->users->findById($userId)]);
    }
}
