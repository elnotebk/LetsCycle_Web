<?php
// =====================================================================
// WEEK 5 - ENDPOINT API VERSI PROSEDURAL
// Contoh pemakaian (setelah server jalan di port 3001):
//   http://127.0.0.1:3001/api.php?resource=products
//   http://127.0.0.1:3001/api.php?resource=products&q=tas
//   http://127.0.0.1:3001/api.php?resource=locations&kota=Malang
//
// Bandingkan dengan versi MVC: GET /api/products dan GET /api/locations
// =====================================================================

declare(strict_types=1);

require __DIR__ . '/functions.php';

// 1. Ambil input dari URL ($_GET)
$resource = $_GET['resource'] ?? '';
$q        = is_string($_GET['q'] ?? null) ? $_GET['q'] : '';
$kota     = is_string($_GET['kota'] ?? null) ? $_GET['kota'] : '';

// 2. Hanya terima metode GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    kirim_json(405, ['ok' => false, 'pesan' => 'Metode tidak diizinkan.']);
}

// 3. Proses sesuai resource yang diminta
if ($resource === 'products') {
    $produk = cari_produk(baca_data(FILE_PRODUK), $q);
    kirim_json(200, ['ok' => true, 'products' => $produk]);
}

if ($resource === 'locations') {
    $lokasi = cari_lokasi(baca_data(FILE_LOKASI), $q, $kota);
    kirim_json(200, ['ok' => true, 'locations' => $lokasi]);
}

// 4. Resource tidak dikenal
kirim_json(404, ['ok' => false, 'pesan' => 'Resource tidak ditemukan.']);