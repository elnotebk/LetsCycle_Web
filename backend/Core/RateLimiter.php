<?php

declare(strict_types=1);

namespace LetCycle\Core;

/** Counts attempts per key in a locked file, because PHP keeps no memory between requests. */
final class RateLimiter
{
    private const MAXIMUM_KEYS = 10000;

    public function __construct(
        private readonly string $file,
        private readonly int $limit,
        private readonly int $windowSeconds,
    ) {
    }

    /** Records an attempt, returning false when the key has none left. */
    public function attempt(string $key): bool
    {
        return $this->withEntries(function (array &$entries) use ($key): bool {
            $id = hash('sha256', $key);
            $entry = $entries[$id] ?? ['count' => 0, 'resetAt' => time() + $this->windowSeconds];
            if ($entry['count'] >= $this->limit) {
                return false;
            }
            $entry['count']++;
            if (count($entries) >= self::MAXIMUM_KEYS) {
                $entries = [];
            }
            $entries[$id] = $entry;
            return true;
        });
    }

    /** Forgets the attempts recorded for a key. */
    public function reset(string $key): void
    {
        $this->withEntries(function (array &$entries) use ($key): bool {
            unset($entries[hash('sha256', $key)]);
            return true;
        });
    }

    private function withEntries(callable $update): bool
    {
        if (!is_dir(dirname($this->file))) {
            mkdir(dirname($this->file), 0700, true);
        }

        $handle = fopen($this->file, 'c+');
        if ($handle === false || !flock($handle, LOCK_EX)) {
            throw new \RuntimeException('Tidak dapat membuka penghitung percobaan.');
        }

        try {
            $entries = json_decode((string) stream_get_contents($handle), true) ?: [];
            $now = time();
            $entries = array_filter($entries, static fn (array $entry): bool => $entry['resetAt'] > $now);
            $result = $update($entries);

            ftruncate($handle, 0);
            rewind($handle);
            fwrite($handle, json_encode($entries, JSON_THROW_ON_ERROR));
            return $result;
        } finally {
            flock($handle, LOCK_UN);
            fclose($handle);
        }
    }
}
