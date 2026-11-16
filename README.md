# Lost & Found Pacil

Situs web untuk mempertemukan mahasiswa yang kehilangan barang dengan yang menemukannya di lingkungan Fakultas Ilmu Komputer, Universitas Indonesia.  
Proyek akhir **RISTEK Open Class Web Development 2026 — Kelompok 2**.

## Tim & Mentor

| Nama | Peran | Tanggung Jawab Utama |
| --- | --- | --- |
| Bhre Nabil Faeyza | Backend | Desain DB, kontrak REST API, Express server, validasi, Prisma, Cloudinary, deployment BE |
| M. Zaidan Zuhdi Khair | Frontend | Halaman daftar & detail laporan, filter, pencarian, paginasi, integrasi API daftar/detail, deployment FE |
| Faris Muhammad Firhan Putra Indriya | Frontend | Halaman formulir lapor, validasi & pemilih foto, klien API & mode tiruan, penanganan error per kolom |

**Mentor:** Leficullen (`alfcullen`)

---

## Tech Stack

- **Frontend:** React.js + Vite
- **Backend:** Node.js + Express.js
- **Database & ORM:** PostgreSQL + Prisma ORM
- **Media Storage:** Cloudinary
- **Testing & Tooling:** Vitest, Supertest, Zod, Multer, GitHub

---

## Fitur Utama & Halaman

### Fitur Wajib (P0)

| Fitur | Kriteria Selesai | Target |
| --- | --- | --- |
| 1. Daftar & detail laporan publik | Menampilkan 12 laporan per halaman (terbaru dulu). Kartu membuka detail lewat `id`. ID tidak valid/tidak ada menampilkan halaman tidak ditemukan | CP2 |
| 2. Cari & filter | Pencarian `q` pada nama barang (*case-insensitive*). Filter `type`, `categoryId`, dan `locationId` digabung dengan logika `AND`. Hasil kosong menampilkan pesan & tombol reset | CP2 |
| 3. Kirim laporan | Validasi di FE dan BE. Sukses mengarahkan ke halaman detail laporan baru. Gagal menampilkan pesan galat di bawah field terkait | CP2 (teks), CP3 (foto) |
| 4. Placeholder gambar | Laporan tanpa foto (`photoUrl: null`) atau gagal muat menampilkan gambar bawaan berasio 4:3 | CP2 |
| 5. Privasi kontak | Pelapor memilih satu metode kontak; respons API hanya memuat metode tersebut di setiap endpoint | CP2 (kontrak), CP3 (Prisma `select`) |

### Daftar Halaman Aplikasi

| Halaman | Rute | Isi Utama | Endpoint yang Dipanggil |
| --- | --- | --- | --- |
| Daftar laporan | `/` | Kolom cari, filter jenis/kategori/lokasi, grid kartu laporan, paginasi, tombol **Lapor barang** | `GET /categories`, `GET /locations`, `GET /reports` |
| Detail laporan | `/laporan/:id` | Foto/placeholder, jenis (`Hilang`/`Ditemukan`), nama barang, deskripsi, kategori, lokasi, tanggal, satu kontak terpilih, nama pelapor | `GET /reports/:id` |
| Lapor barang | `/lapor` | Formulir pengiriman laporan dengan validasi per kolom dan pemilih foto | `GET /categories`, `GET /locations`, `POST /reports` |
| Tidak ditemukan | `*` | Pesan singkat dan tautan kembali ke `/` | — |

---

## Pembagian Kerja per Checkpoint

| Checkpoint | Tenggat | Bhre (Backend) | Zaidan (Frontend) | Faris (Frontend) |
| --- | --- | --- | --- | --- |
| **CP1** | 16 Nov 2026 | Repositori backend, README, desain DB, kontrak API, data tiruan | Repositori frontend (React + Vite), routing, sketsa halaman daftar & detail | Sketsa formulir lapor, daftar komponen, aturan validasi FE, bagian halaman di README |
| **CP2** | 19 Nov 2026 | Express dengan 6 endpoint & penyimpanan memori, validasi Zod, format galat seragam, deploy API + CORS, uji T1–T9 | Halaman daftar & detail, kartu laporan, filter, pencarian, paginasi, placeholder gambar | Formulir lapor dengan validasi & pemilih foto, klien API & mode tiruan, state memuat/galat/kosong |
| **CP3** | 22 Nov 2026 | Skema Prisma, migrasi, seed, integrasi Cloudinary, ganti store ke Prisma, privasi via `select`, deploy final | Sambungkan daftar, detail, dan filter ke API nyata, tangani loading/error, deploy frontend | Sambungkan formulir & unggah foto ke API nyata, tampilkan galat server per kolom, bahan demo |

---

## Desain Basis Data

### Diagram Relasi

```text
+---------------+       1:N       +-----------------------------------+       N:1       +---------------+
|   Category    |----------------<|              Report               |>----------------|   Location    |
+---------------+                 +-----------------------------------+                 +---------------+
| id (PK, Int)  |                 | id (PK, UUID)                     |                 | id (PK, Int)  |
| name (Unique) |                 | type (LOST | FOUND)               |                 | name (Unique) |
+---------------+                 | title (VarChar 100)               |                 +---------------+
                                  | description (VarChar 1000)        |
                                  | categoryId (FK -> Category.id)    |
                                  | locationId (FK -> Location.id)    |
                                  | locationDetail (VarChar 100, ?)   |
                                  | eventDate (Date)                  |
                                  | photoUrl (Text, ?)                |
                                  | photoPublicId (Text, ?, privat)   |
                                  | contactMethod (Enum)              |
                                  | contactValue (VarChar 100)        |
                                  | reporterName (VarChar 50, ?)      |
                                  | status (ACTIVE | RESOLVED)        |
                                  | editTokenHash (Text, ?, privat)   |
                                  | createdAt (DateTime)              |
                                  | updatedAt (DateTime)              |
                                  +-----------------------------------+
```

### Struktur Tabel `Report`

| Field | Tipe | Wajib | Aturan Validasi | Tampil di API Publik |
| --- | --- | --- | --- | --- |
| `id` | `UUID` | Otomatis | Dibuat server (`uuidv4`) | Ya |
| `type` | Enum (`LOST`, `FOUND`) | Ya | Salah satu dari `LOST` atau `FOUND` | Ya |
| `title` | `String` | Ya | 3–100 karakter (nama barang) | Ya |
| `description` | `String` | Ya | 10–1000 karakter (ciri barang & kronologi) | Ya |
| `categoryId` | `Int` (FK) | Ya | Harus terdaftar di tabel `Category` | Ya (sebagai objek `category`) |
| `locationId` | `Int` (FK) | Ya | Harus terdaftar di tabel `Location` | Ya (sebagai objek `location`) |
| `locationDetail` | `String?` | Tidak | Maksimal 100 karakter (misal: `Ruang A206`) | Ya |
| `eventDate` | `Date` (`YYYY-MM-DD`) | Ya | Tanggal kejadian, tidak boleh di masa depan | Ya |
| `photoUrl` | `String?` | Tidak | URL aman dari Cloudinary, `null` jika tanpa foto | Ya |
| `photoPublicId` | `String?` | Tidak | Public ID berkas di Cloudinary untuk keperluan cleanup | **Tidak** |
| `contactMethod` | Enum | Ya | `WHATSAPP`, `LINE`, `INSTAGRAM`, atau `EMAIL` | Ya |
| `contactValue` | `String` | Ya | Divalidasi & dinormalisasi sesuai metode | Ya |
| `reporterName` | `String?` | Tidak | Maksimal 50 karakter | Ya |
| `status` | Enum | Otomatis | Default `ACTIVE` (`ACTIVE` / `RESOLVED`) | Ya |
| `editTokenHash` | `String?` | Tidak | Hash kode kelola untuk fitur P1 tandai selesai | **Tidak** |
| `createdAt`, `updatedAt` | `DateTime` | Otomatis | Diatur otomatis oleh Prisma (ISO 8601 UTC) | Ya |

### Aturan Validasi & Normalisasi Kontak

| Metode | Aturan Masukan | Format Tersimpan |
| --- | --- | --- |
| `WHATSAPP` | Nomor Indonesia diawali `08`, `628`, atau `+628` (10–14 digit) | Digit saja berawalan `62` (contoh: `6281234567890`) |
| `LINE` | 3–30 karakter (`a-z`, `A-Z`, `0-9`, `.`, `_`, `-`) | Apa adanya |
| `INSTAGRAM` | 1–30 karakter (`a-z`, `A-Z`, `0-9`, `.`, `_`), tanpa awalan `@` | Tanpa `@` |
| `EMAIL` | Format email valid, maksimal 100 karakter | Huruf kecil (*lowercase*) |

### Rencana Pemetaan ke Prisma (Checkpoint 3)

Skema lengkap tersedia di `prisma/schema.prisma` dengan indeks pada:
- `@@index([type, createdAt])` untuk pengurutan daftar terbaru dan filter jenis laporan.
- `@@index([categoryId])` dan `@@index([locationId])` untuk mempercepat filter kategori dan lokasi.
- Privasi ditegakkan di `src/store/prisma.store.js` melalui `publicReportSelect` yang hanya memilih kolom publik sehingga `photoPublicId` dan `editTokenHash` tidak pernah keluar dari database ke lapisan controller.

---

## Kontrak REST API (Ringkasan)

Dokumentasi lengkap request, response, contoh payload, dan daftar kode galat tersedia di **[`docs/api.md`](./docs/api.md)**.

| Metode | Path | Fungsi | Kode Sukses | Kode Galat |
| --- | --- | --- | --- | --- |
| `GET` | `/health` | Pemeriksaan status server | `200` | — |
| `GET` | `/categories` | Daftar seluruh kategori | `200` | — |
| `GET` | `/locations` | Daftar seluruh lokasi | `200` | — |
| `GET` | `/reports` | Daftar laporan dengan pencarian, filter, dan paginasi | `200` | `400` |
| `GET` | `/reports/:id` | Detail satu laporan berdasarkan UUID | `200` | `400`, `404` |
| `POST` | `/reports` | Membuat laporan baru (`multipart/form-data`) | `201` | `400`, `413`, `415`, `502` |
| `PUT/PATCH/DELETE` | `/reports` & `/reports/:id` | Ditolak demi keamanan data publik | — | `405` |

### Pencarian, Filter, dan Paginasi (`GET /reports`)

- **Query Parameters:** `q` (1–100 karakter, *case-insensitive* pada `title`), `type` (`LOST` | `FOUND`), `categoryId` (integer positif), `locationId` (integer positif), `page` (default `1`), `limit` (1–50, default `12`).
- Semua filter digabung dengan logika **`AND`** dan diurutkan berdasarkan `createdAt` menurun (terbaru lebih dulu).
- Query parameter tidak valid mengembalikan `400 INVALID_QUERY`. Halaman di luar jangkauan mengembalikan `200` dengan `"data": []`.

### Format Kiriman Laporan & Unggah Foto (`POST /reports`)

- Selalu menggunakan **`multipart/form-data`** sejak Checkpoint 2 agar kontrak tidak berubah saat foto diaktifkan di Checkpoint 3.
- Field `photo` bersifat opsional (1 berkas, format `image/jpeg`, `image/png`, atau `image/webp`, maksimal **5 MB**).
- Di **Checkpoint 2** (`STORE_DRIVER=memory`), berkas `photo` divalidasi format & ukurannya lalu diabaikan (`photoUrl: null`).
- Di **Checkpoint 3** (`STORE_DRIVER=prisma`), berkas diunggah melalui server ke folder `lostfound` di Cloudinary menggunakan `upload_stream` setelah seluruh validasi teks lolos. Jika penyimpanan database gagal setelah unggah berhasil, server melakukan pembersihan otomatis (`cloudinary.uploader.destroy`).

---

## Data Tiruan (*Mock Data*)

Berkas data tiruan bersama tersedia di folder `mock/` (dan disalin ke repositori frontend):
- `mock/lookups.json`: 8 kategori dan 9 lokasi kampus.
- `mock/reports.json`: 6 laporan contoh (3 `LOST`, 3 `FOUND`, 2 dengan `photoUrl`, 4 tanpa foto, mencakup keempat metode kontak).

---

## Menjalankan Secara Lokal

### Prasyarat
- Node.js v20+
- PostgreSQL (hanya diperlukan mulai Checkpoint 3 saat `STORE_DRIVER=prisma`)

### Langkah Instalasi

1. Clone repositori dan masuk ke direktori proyek:
   ```bash
   git clone <URL_REPOSITORI_BACKEND>
   cd lostfound-backend
   ```
2. Salin berkas environment dan sesuaikan nilainya:
   ```bash
   cp .env.example .env
   ```
3. Pasang dependensi:
   ```bash
   npm install
   ```
4. Jalankan server pengembangan (default berjalan di `http://localhost:3000` dengan `STORE_DRIVER=memory`):
   ```bash
   npm run dev
   ```
5. Jalankan pengujian otomatis (Uji T1–T9):
   ```bash
   npm test
   ```

### Persiapan Database (Checkpoint 3)

```bash
# Pastikan DATABASE_URL di .env sudah terisi dan STORE_DRIVER=prisma
npx prisma migrate dev --name init
npm run db:seed
```

### Variabel Lingkungan

| Variabel | Wajib | Keterangan |
| --- | --- | --- |
| `PORT` | Tidak | Port HTTP server (default: `3000`) |
| `FRONTEND_ORIGIN` | Ya | Origin frontend yang diizinkan CORS (mendukung daftar dipisah koma; `http://localhost:5173` otomatis diizinkan) |
| `STORE_DRIVER` | Tidak | `memory` untuk Checkpoint 2 (default), `prisma` untuk Checkpoint 3 |
| `DATABASE_URL` | CP3 | Connection string PostgreSQL |
| `CLOUDINARY_CLOUD_NAME` | CP3 | Cloud name akun Cloudinary |
| `CLOUDINARY_API_KEY` | CP3 | API key Cloudinary |
| `CLOUDINARY_API_SECRET` | CP3 | API secret Cloudinary |

---

## Aturan Git Tim

- Branch `main` selalu dalam keadaan dapat dijalankan dan lolos `npm test`.
- Pengembangan fitur dilakukan di branch terpisah dengan format `<jenis>/<ringkas>` (contoh: `feat/reports-endpoint`, `docs/api-contract`).
- Gunakan format commit konvensional: `feat:`, `fix:`, `docs:`, `chore:`, `test:`.
- Penggabungan ke `main` menggunakan **merge commit** atau **rebase** (bukan *squash*) agar histori commit tiap anggota terlihat jelas.