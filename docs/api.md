# Lost and Found Pacil - API Contract & Documentation

Dokumen ini merupakan kontrak resmi REST API backend untuk integrasi tim Frontend (Zaidan & Faris).

## Base URL

- Lokal: `http://localhost:3000/api`
- Health check: `http://localhost:3000/health`

---

## Standar Response Envelope

### 1. Format Response Sukses
Semua endpoint sukses mengembalikan JSON dengan format:
```json
{
  "data": { ... },
  "meta": { ... } // opsional, disertakan pada list data dengan pagination
}
```

### 2. Format Response Error
Semua endpoint error mengembalikan format seragam:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validasi input gagal",
    "details": [
      {
        "field": "title",
        "message": "Judul minimal 5 karakter"
      }
    ]
  }
}
```

---

## Ringkasan Endpoint

| Method | Endpoint | Deskripsi | Status Sukses |
|---|---|---|---|
| `GET` | `/health` | Pemeriksaan kesehatan server | `200 OK` |
| `GET` | `/api/lookups/categories` | Daftar 8 kategori barang | `200 OK` |
| `GET` | `/api/lookups/locations` | Daftar 9 lokasi kampus Fasilkom | `200 OK` |
| `GET` | `/api/reports` | List laporan (filter, search, pagination) | `200 OK` |
| `GET` | `/api/reports/:id` | Detail 1 laporan berdasarkan UUID | `200 OK` |
| `POST` | `/api/reports` | Buat laporan baru (multipart/form-data) | `201 Created` |
| `PUT/PATCH/DELETE` | `/api/reports*` | Metode HTTP tidak diizinkan | `405 Method Not Allowed` |

---

## Detail Endpoint

### 1. Health Check
- **URL**: `GET /health`
- **Response**:
```json
{
  "status": "ok",
  "timestamp": "2026-11-15T12:00:00.000Z"
}
```

---

### 2. Lookup Kategori
- **URL**: `GET /api/lookups/categories`
- **Response 200**:
```json
{
  "data": [
    { "id": "ELECTRONICS", "name": "Elektronik", "description": "Laptop, HP, charger, mouse" },
    { "id": "TUMBLR", "name": "Botol Minum / Tumblr", "description": "Tumblr Corkcicle, Hydro Flask" }
  ]
}
```

---

### 3. Lookup Lokasi
- **URL**: `GET /api/lookups/locations`
- **Response 200**:
```json
{
  "data": [
    { "id": "LAB_KOMPUTER", "name": "Lab Komputer (Gedung B)", "description": "Lab Komputasi Dasar" },
    { "id": "PERPUSTAKAAN", "name": "Perpustakaan (Gedung A Lt. 1)", "description": "Area baca" }
  ]
}
```

---

### 4. List Laporan
- **URL**: `GET /api/reports`
- **Query Parameters**:
  - `type`: `LOST` atau `FOUND` (opsional)
  - `category`: ID kategori, misal `ELECTRONICS` (opsional)
  - `location`: ID lokasi, misal `LAB_KOMPUTER` (opsional)
  - `status`: `OPEN` atau `RESOLVED` (opsional)
  - `search`: Kata kunci pencarian judul (case-insensitive, opsional)
  - `page`: Nomor halaman (default: `1`, minimal `1`)
  - `limit`: Jumlah data per halaman (default: `10`, range: `1` sampai `50`)
- **Response 200**:
```json
{
  "data": [
    {
      "id": "e4a1b8c2-3f5d-4a1e-8b9c-0d1e2f3a4b5c",
      "type": "LOST",
      "title": "Kehilangan Tumblr Corkcicle Matte Black",
      "description": "Tumblr warna matte black ada stiker GitHub.",
      "category": "TUMBLR",
      "location": "KELAS_B",
      "locationDetail": "Ruang 2102 baris ketiga",
      "date": "2026-11-14T08:30:00.000Z",
      "photoUrl": "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      "status": "OPEN",
      "reporterName": "Bhre Nabil Faeyza",
      "reporterEmail": "bhrenabil@gmail.com",
      "reporterPhone": "6281234567890",
      "reporterLineId": "bhrenabil",
      "createdAt": "2026-11-14T09:00:00.000Z",
      "updatedAt": "2026-11-14T09:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

---

### 5. Detail Laporan
- **URL**: `GET /api/reports/:id`
- **Response 200**:
```json
{
  "data": {
    "id": "e4a1b8c2-3f5d-4a1e-8b9c-0d1e2f3a4b5c",
    "type": "LOST",
    "title": "Kehilangan Tumblr Corkcicle Matte Black",
    "description": "Tumblr warna matte black ada stiker GitHub.",
    "category": "TUMBLR",
    "location": "KELAS_B",
    "locationDetail": "Ruang 2102 baris ketiga",
    "date": "2026-11-14T08:30:00.000Z",
    "photoUrl": "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    "status": "OPEN",
    "reporterName": "Bhre Nabil Faeyza",
    "reporterEmail": "bhrenabil@gmail.com",
    "reporterPhone": "6281234567890",
    "reporterLineId": "bhrenabil",
    "createdAt": "2026-11-14T09:00:00.000Z",
    "updatedAt": "2026-11-14T09:00:00.000Z"
  }
}
```
- **Response 404 (Tidak Ditemukan)**:
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Laporan dengan ID tersebut tidak ditemukan"
  }
}
```

---

### 6. Buat Laporan Baru
- **URL**: `POST /api/reports`
- **Content-Type**: `multipart/form-data`
- **Fields (Form Data)**:
  - `type` (wajib): `LOST` atau `FOUND`
  - `title` (wajib): string, 5 - 100 karakter
  - `description` (wajib): string, 10 - 1000 karakter
  - `category` (wajib): enum valid (misal `ELECTRONICS`, `TUMBLR`, dll.)
  - `location` (wajib): enum valid (misal `LAB_KOMPUTER`, `KANTIN`, dll.)
  - `locationDetail` (opsional): string, maks 200 karakter
  - `date` (wajib): string ISO-8601 (tidak boleh tanggal masa depan)
  - `reporterName` (wajib): string, 2 - 100 karakter
  - `reporterEmail` (wajib): string format email valid
  - `reporterPhone` (wajib): string nomor HP (format `08...` atau `628...`)
  - `reporterLineId` (opsional): string ID LINE
  - `photo` (opsional): file gambar (JPEG, PNG, WebP; maks 5MB)
- **Response 201 Created**:
```json
{
  "data": {
    "id": "c7f1a923-93d1-4172-8809-54359e1987d6",
    "type": "LOST",
    "title": "Mouse Logitech MX Master 3S Tertinggal",
    "description": "Mouse bluetooth warna putih tertinggal di lab.",
    "category": "ELECTRONICS",
    "location": "LAB_KOMPUTER",
    "locationDetail": "Meja PC 04",
    "date": "2026-11-15T09:00:00.000Z",
    "photoUrl": "https://res.cloudinary.com/.../lostfound/sample.jpg",
    "status": "OPEN",
    "reporterName": "Bhre Nabil Faeyza",
    "reporterEmail": "bhrenabil@gmail.com",
    "reporterPhone": "6281234567890",
    "reporterLineId": null,
    "createdAt": "2026-11-15T10:00:00.000Z",
    "updatedAt": "2026-11-15T10:00:00.000Z"
  }
}
```

