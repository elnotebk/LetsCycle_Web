<?php

declare(strict_types=1);

const FILE_PRODUK = __DIR__ . '/../data/products.txt';
const FILE_LOKASI = __DIR__ . '/../data/locations.txt';

/** @return array<int, array<string, mixed>> */
function baca_data(string $file): array
{
    $lines = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($lines === false) {
        throw new RuntimeException("Tidak dapat membaca data: {$file}");
    }

    $records = [];
    foreach ($lines as $line) {
        $record = json_decode($line, true, 512, JSON_THROW_ON_ERROR);
        if (!is_array($record)) {
            throw new UnexpectedValueException("Format data tidak valid: {$file}");
        }
        $records[] = $record;
    }

    return $records;
}

/** @param array<int, array<string, mixed>> $produk
 *  @return array<int, array<string, mixed>>
 */
function cari_produk(array $produk, string $q): array
{
    $q = mb_strtolower(trim($q));
    if ($q === '') {
        return $produk;
    }

    return array_values(array_filter(
        $produk,
        static function (array $item) use ($q): bool {
            $teks = mb_strtolower(implode(' ', [
                (string) ($item['nama'] ?? ''),
                (string) ($item['kataKunci'] ?? ''),
                (string) ($item['kategori'] ?? ''),
            ]));

            return str_contains($teks, $q);
        },
    ));
}

/** @param array<int, array<string, mixed>> $lokasi
 *  @return array<int, array<string, mixed>>
 */
function cari_lokasi(array $lokasi, string $q, string $kota): array
{
    $q = mb_strtolower(trim($q));
    $kota = mb_strtolower(trim($kota));

    return array_values(array_filter(
        $lokasi,
        static function (array $item) use ($q, $kota): bool {
            $teks = mb_strtolower(implode(' ', [
                (string) ($item['nama'] ?? ''),
                (string) ($item['alamat'] ?? ''),
            ]));
            $kotaItem = mb_strtolower((string) ($item['kota'] ?? ''));

            return ($q === '' || str_contains($teks, $q))
                && ($kota === '' || $kotaItem === $kota);
        },
    ));
}

/** @param array<string, mixed> $data */
function kirim_json(int $status, array $data): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    exit;
}

function e(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function format_rupiah(int|float $nilai): string
{
    return 'Rp ' . number_format($nilai, 0, ',', '.');
}