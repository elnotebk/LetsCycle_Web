<?php

declare(strict_types=1);

namespace LetCycle\Repositories;

use LetCycle\Models\Model;

/** Reads models from a file holding one JSON record per line. */
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
}
