# Lost and Found Pacil - Backend REST API

REST API untuk platform Lost and Found Kampus Fasilkom UI, dikembangkan sebagai bagian dari **RISTEK Open Class Web Development 2026**.

## Anggota Tim (Kelompok 2)

- **Mentor**: Leficullen (`alfcullen`)
- **Backend Developer**: Bhre Nabil Faeyza
- **Frontend Developers**:
  - M. Zaidan Zuhdi Khair
  - Faris Muhammad Firhan Putra Indriya

---

## Status Checkpoint & Roadmap

- [x] **Checkpoint 1 (Tenggat: 16 Nov 2026)**:
  - Inisialisasi repositori, konfigurasi Git, `.gitignore`, dan `.env.example`.
  - Desain database & mock data (`mock/lookups.json`, `mock/reports.json`).
  - Kontrak resmi API di [docs/api.md](docs/api.md).
  - Setup Express server, endpoint `GET /health`, dan unit test otomatis.
- [ ] **Checkpoint 2 (Tenggat: 19 Nov 2026)**:
  - In-memory store driver, validasi Zod, dan standardisasi error handling.
  - Implementasi 6 endpoint REST API (`lookups`, `reports`, dan validasi status).
  - Test suite lengkap T1-T9 dan deployment API untuk tim frontend.
- [ ] **Checkpoint 3 (Tenggat: 22 Nov 2026)**:
  - Migrasi skema database PostgreSQL menggunakan Prisma ORM.
  - Integrasi Cloudinary image upload dengan mekanisme rollback.
  - Test suite T10-T12 dan finalisasi deployment.

---

## Struktur Direktori

```text
lostfound-backend/
├── docs/
│   └── api.md                     # Dokumentasi kontrak API untuk frontend
├── mock/
│   ├── lookups.json               # Data kategori dan lokasi kampus
│   └── reports.json               # Data tiruan laporan hilang dan temuan
├── prisma/
│   ├── schema.prisma              # Skema model dan enum Prisma (Checkpoint 3)
│   └── seed.js                    # Script seeder database (Checkpoint 3)
├── src/
│   ├── config/
│   │   └── env.js                 # Loader variabel lingkungan
│   ├── app.js                     # Inisialisasi Express & middleware
│   └── server.js                  # Entry point server HTTP
├── tests/
│   └── health.test.js             # Pengujian unit health check
├── .env.example                   # Template variabel lingkungan
├── .gitignore                     # Filter file yang diabaikan Git
├── package.json                   # Dependensi dan scripts
└── README.md                      # Dokumentasi utama proyek
```

---

## Memulai Proyek (Panduan Instalasi Lokal)

### 1. Prasyarat
- Node.js versi 18 atau lebih baru
- npm versi 9 atau lebih baru

### 2. Kloning dan Pasang Dependensi
```bash
git clone <url-repository-kamu>
cd lostfound-backend
npm install
```

### 3. Konfigurasi Variabel Lingkungan
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```

Isi variabel dasar:
```env
PORT=3000
NODE_ENV=development
FRONTEND_ORIGIN=http://localhost:5173
STORE_DRIVER=memory
```

### 4. Menjalankan Server
Mode pengembangan (auto-reload menggunakan Node watch mode):
```bash
npm run dev
```

Mode produksi:
```bash
npm start
```

Server akan aktif di `http://localhost:3000`.

### 5. Memeriksa Endpoint Health
Buka browser atau gunakan curl:
```bash
curl http://localhost:3000/health
```
Response:
```json
{
  "status": "ok",
  "timestamp": "2026-11-15T12:00:00.000Z"
}
```

### 6. Menjalankan Pengujian (Testing)
Untuk menjalankan suite pengujian otomatis:
```bash
npm test
```

---

## Kontrak API & Mock Data

Kontrak lengkap endpoint, format request payload, dan response envelope dapat dilihat pada:
- **[Dokumentasi Kontrak API](docs/api.md)**
- **[Mock Data Kategori & Lokasi](mock/lookups.json)**
- **[Mock Data Laporan](mock/reports.json)**
