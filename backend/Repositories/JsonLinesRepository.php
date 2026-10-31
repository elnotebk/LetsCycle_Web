<?php

declare(strict_types=1);

namespace LetCycle\Repositories;

use LetCycle\Models\Model;

/** Keeps models in a file holding one JSON record per line. */
abstract class JsonLinesRepository
{
    protected readonly string $file;

    public function __construct(protected readonly string $dataDirectory, string $fileName)
    {
        $this->file = "{$dataDirectory}/{$fileName}";
    }

    /** Builds the model for one stored record. */
    abstract protected function toModel(array $record): Model;

    /** @return Model[] */
    protected function readAll(): array
    {
        if (!is_file($this->file)) {
            return [];
        }
        $lines = file($this->file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        return array_map(
            fn (string $line): Model => $this->toModel(json_decode($line, true, 16, JSON_THROW_ON_ERROR)),
            $lines,
        );
    }

    /** Encodes a model as one stored line. */
    protected function toLine(Model $model): string
    {
        $line = json_encode($model->toArray(), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
        return "{$line}\n";
    }

    /** Runs an operation while holding the store's lock file. */
    protected function withLock(int $mode, callable $operation): mixed
    {
        if (!is_dir($this->dataDirectory)) {
            mkdir($this->dataDirectory, 0700, true);
        }

        $lock = fopen("{$this->file}.lock", 'c');
        if ($lock === false || !flock($lock, $mode)) {
            throw new \RuntimeException('Tidak dapat mengunci data.');
        }

        try {
            return $operation();
        } finally {
            flock($lock, LOCK_UN);
            fclose($lock);
        }
    }
}
