<?php
// =====================================================================
// WEEK 5 - HALAMAN PHP PROSEDURAL (PHP + HTML dalam satu file)
// Menunjukkan: $_GET (pencarian), $_POST (form), $_SESSION (keranjang),
// perulangan foreach, fungsi, dan output HTML dari PHP.
// =====================================================================

declare(strict_types=1);

session_start();
require __DIR__ . '/functions.php';

// --- 1. Proses form POST: tambah produk ke keranjang (disimpan di session)
$pesan = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $idProduk = filter_input(INPUT_POST, 'id_produk', FILTER_VALIDATE_INT);

    if ($idProduk === false || $idProduk === null) {
        $pesan = 'Produk tidak valid.';
    } else {
        $_SESSION['keranjang'][$idProduk] = ($_SESSION['keranjang'][$idProduk] ?? 0) + 1;
        $pesan = 'Produk berhasil ditambahkan ke keranjang.';
    }
}

// --- 2. Proses pencarian GET: ?q=kata
$q = is_string($_GET['q'] ?? null) ? $_GET['q'] : '';
$produk = cari_produk(baca_data(FILE_PRODUK), $q);

// --- 3. Hitung total isi keranjang
$totalItem = array_sum($_SESSION['keranjang'] ?? []);
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>LetCycle - PHP Prosedural (Week 5)</title>
    <style>
        body { font-family: sans-serif; max-width: 900px; margin: 24px auto; padding: 0 16px; color: #263238; }
        h1 { color: #1F5C2E; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border-bottom: 1px solid #D5E2CC; padding: 8px; text-align: left; }
        th { background: #E8F0E2; }
        .pesan { background: #E8F0E2; padding: 8px 12px; border-radius: 6px; }
        button { background: #3A7D44; color: #fff; border: 0; padding: 6px 12px; border-radius: 6px; cursor: pointer; }
    </style>
</head>
<body>
    <h1>LetCycle - Produk (PHP Prosedural)</h1>
    <p>Isi keranjang: <strong><?= $totalItem ?></strong> item</p>

    <?php if ($pesan !== ''): ?>
        <p class="pesan"><?= e($pesan) ?></p>
    <?php endif; ?>

    <form method="get">
        <input type="search" name="q" value="<?= e($q) ?>" placeholder="Cari produk...">
        <button type="submit">Cari</button>
    </form>
    <br>

    <table>
        <tr><th>Nama</th><th>Kategori</th><th>Harga</th><th>Rating</th><th></th></tr>

        <?php foreach ($produk as $item): ?>
            <tr>
                <td><?= e($item['nama']) ?></td>
                <td><?= e($item['kategori']) ?></td>
                <td><?= format_rupiah($item['harga']) ?></td>
                <td><?= $item['rating'] ?></td>
                <td>
                    <form method="post">
                        <input type="hidden" name="id_produk" value="<?= (int) $item['id'] ?>">
                        <button type="submit">Tambah</button>
                    </form>
                </td>
            </tr>
        <?php endforeach; ?>

        <?php if (count($produk) === 0): ?>
            <tr><td colspan="5">Produk tidak ditemukan.</td></tr>
        <?php endif; ?>
    </table>

    <p><a href="api.php?resource=products">Lihat data yang sama sebagai JSON (api.php)</a></p>
</body>
</html>