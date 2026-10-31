<?php

declare(strict_types=1);

namespace LetCycle\Views;

/** Renders API responses in the JSON shape the frontend expects. */
final class JsonView
{
    /** @param array<string, mixed> $data */
    public function success(int $status, array $data = []): void
    {
        $this->render($status, ['ok' => true] + $data);
    }

    /** @param array<string, string> $headers */
    public function error(int $status, string $message, array $headers = []): void
    {
        foreach ($headers as $name => $value) {
            header("{$name}: {$value}");
        }
        $this->render($status, ['ok' => false, 'pesan' => $message]);
    }

    /** @param array<string, mixed> $payload */
    private function render(int $status, array $payload): void
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store');
        echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    }
}
