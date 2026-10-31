# LetCycle

LetCycle adalah aplikasi web bertema daur ulang yang membantu pengguna mencari lokasi penukaran sampah dan menjelajahi produk di marketplace. Aplikasi ini memiliki antarmuka web berbasis HTML, CSS, dan JavaScript, serta backend PHP yang menyediakan API untuk data dan interaksi pengguna.

## Fitur

- Halaman utama dan formulir daftar serta masuk.
- Pencarian lokasi penukaran sampah berdasarkan kata kunci dan kota, dilengkapi peta.
- Katalog produk marketplace.
- Keranjang belanja dan daftar favorit (wishlist) untuk pengguna yang sudah masuk.
- API PHP untuk autentikasi, lokasi, produk, keranjang, dan wishlist.

## Teknologi

- HTML dan CSS dengan Tailwind CSS.
- JavaScript ES modules untuk interaksi halaman dan komunikasi API.
- PHP untuk routing API dan pemrosesan data.
- Penyimpanan berbasis file melalui repository PHP; aplikasi ini tidak menggunakan database SQL.

## Menjalankan aplikasi

Pastikan PHP dan Node.js/npm sudah terpasang, lalu jalankan dari folder proyek:

```bash
npm install
npm start
```

Buka [http://127.0.0.1:3000](http://127.0.0.1:3000). Halaman utama akan mengarahkan pengguna ke dashboard LetCycle.

Untuk membangun ulang CSS setelah mengubah sumber Tailwind:

```bash
npm run build:css
```

## Struktur proyek

```text
backend/
  Controllers/   Menangani permintaan API
  Core/          Router, request, session, konfigurasi, dan kebutuhan inti
  Models/        Model domain seperti User, Product, Cart, dan Location
  Repositories/  Membaca dan menyimpan data
  Views/         Membentuk respons JSON
public/
  Dashboard/     Halaman utama dan autentikasi
  Lokasi/        Halaman pencarian lokasi penukaran
  Marketplace/   Halaman katalog dan belanja
  index.php      Titik masuk aplikasi
data/            Data awal lokasi dan produk
.runtime/        Akun, sesi, keranjang, dan wishlist (dibuat otomatis, tidak masuk Git)
router.php       Router untuk PHP built-in development server
```

## Alur kerja aplikasi

1. Pengguna membuka halaman di folder `public/`.
2. JavaScript menangani interaksi, seperti klik tombol, pencarian, pengiriman formulir, dan navigasi menu.
3. Jika membutuhkan data, JavaScript mengirim permintaan ke API PHP menggunakan `fetch`.
4. Router mengarahkan permintaan ke controller yang sesuai. Controller memvalidasi dan mengatur proses menggunakan model serta repository.
5. Repository mengambil atau menyimpan data. View membentuk hasilnya sebagai JSON.
6. JavaScript menerima respons API dan memperbarui tampilan, atau menampilkan pesan ketika terjadi kesalahan.

## Perjalanan materi per minggu

Minggu pertama adalah perkenalan dan tidak dibahas dalam alur ini.

### Minggu 2 — HTML dan CSS

Membuat kerangka halaman dan mengatur tampilannya. Pada LetCycle, tahap ini terlihat pada halaman dashboard, lokasi penukaran, dan marketplace yang disusun dengan HTML serta diberi gaya menggunakan CSS dan Tailwind CSS.

### Minggu 3 — JavaScript dan penanganan event

Menambahkan perilaku pada halaman melalui event:

- Klik tombol, misalnya untuk menambah produk ke keranjang atau wishlist.
- Input pencarian dan filter kota untuk menyaring lokasi.
- Submit formulir daftar dan masuk.
- Klik menu untuk berpindah halaman atau menjalankan navigasi.

### Minggu 4 — API

Menghubungkan frontend dengan backend melalui permintaan API. JavaScript mengambil data lokasi dan produk serta mengirim tindakan pengguna seperti masuk, menambah item ke keranjang, dan mengubah wishlist. Respons berhasil maupun kesalahan dari server ditangani sebelum halaman diperbarui.

### Minggu 5 — PHP prosedural

Memahami alur dasar backend: PHP menerima dan memproses permintaan, lalu menghasilkan respons untuk digunakan halaman. Tahap ini menjadi dasar sebelum kode dipecah menjadi bagian-bagian yang lebih terstruktur.

### Minggu 6 — Pemrograman berorientasi objek (OOP)

Mengelompokkan data dan perilaku ke dalam class agar kode lebih terorganisasi dan mudah digunakan kembali. Di LetCycle, contohnya adalah class untuk model seperti `Product`, `User`, dan `Cart`, serta class layanan dan controller.

### Minggu 7 — Model, View, Controller (MVC)

Memisahkan tanggung jawab kode agar lebih mudah dipahami dan dikembangkan:

- **Model** merepresentasikan data dan konsep aplikasi, misalnya produk, lokasi, pengguna, keranjang, dan wishlist.
- **View** menyajikan hasil untuk pengguna atau pemanggil API. Pada backend LetCycle, `JsonView` membentuk respons JSON; tampilan halaman berada di frontend.
- **Controller** menerima permintaan, mengatur proses yang diperlukan, lalu mengirim hasil melalui view.

Dalam implementasi LetCycle, repository juga membantu memisahkan proses baca/simpan data dari controller. Dengan susunan ini, alur API menjadi lebih jelas: permintaan masuk → controller → model/repository → view JSON → frontend.

## Contoh endpoint API

- `GET /api/locations` — mengambil lokasi, dengan filter opsional `q` dan `kota`.
- `GET /api/locations/cities` — mengambil daftar kota.
- `GET /api/products` — mengambil katalog produk.
- `POST /api/test/register` dan `POST /api/test/login` — mendaftar dan masuk.
- `GET /api/cart` dan `POST /api/cart/add` — melihat dan menambah item keranjang.
- `GET /api/wishlist` dan `POST /api/wishlist/toggle` — melihat dan mengubah wishlist.

Endpoint keranjang dan wishlist membutuhkan pengguna yang sudah masuk.