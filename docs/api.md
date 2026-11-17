# Kontrak REST API : Lost & Found Pacil (v1)

- **Base URL Lokal:** `http://localhost:3000`
- **Format Respons:** JSON (`application/json`)
- **Format Tanggal & Waktu:** Tanggal menggunakan `YYYY-MM-DD`; timestamp menggunakan ISO 8601 UTC (`YYYY-MM-DDTHH:mm:ss.sssZ`).
- **CORS:** Mengizinkan asal dari `FRONTEND_ORIGIN` dan `http://localhost:5173` dengan metode `GET`, `POST`, `OPTIONS` serta header `Content-Type`.

---

## 1. Bentuk Objek Laporan (`Report`)

Struktur objek laporan bersifat identik pada endpoint daftar (`GET /reports`), detail (`GET /reports/:id`), dan respons pembuatan (`POST /reports`):

```json
{
  "id": "6b1f6a52-3c1b-4a7e-9c55-0d6a1f2e8b01",
  "type": "LOST",
  "title": "Tumbler biru Tupperware",
  "description": "Tumbler biru tutup putih, ada stiker kucing di badan. Tertinggal setelah kuliah pagi.",
  "category": {
    "id": 4,
    "name": "Botol minum"
  },
  "location": {
    "id": 1,
    "name": "Ruang kelas"
  },
  "locationDetail": "Ruang A206",
  "eventDate": "2026-11-12",
  "photoUrl": null,
  "contactMethod": "WHATSAPP",
  "contactValue": "6281234567890",
  "reporterName": "Rani",
  "status": "ACTIVE",
  "createdAt": "2026-11-12T08:15:00.000Z",
  "updatedAt": "2026-11-12T08:15:00.000Z"
}
```

> **Catatan Privasi:** Kolom internal seperti `photoPublicId` dan `editTokenHash` tidak pernah disertakan pada respons publik mana pun.

---

## 2. Daftar Endpoint

### `GET /health`
Mengecek ketersediaan server.

- **Respons `200 OK`:**
  ```json
  {
    "status": "ok",
    "timestamp": "2026-11-15T12:00:00.000Z"
  }
  ```

---

### `GET /categories`
Mengambil daftar referensi kategori barang untuk filter dan formulir.

- **Respons `200 OK`:**
  ```json
  {
    "data": [
      { "id": 1, "name": "KTM dan kartu identitas" },
      { "id": 2, "name": "Elektronik dan charger" }
    ]
  }
  ```

---

### `GET /locations`
Mengambil daftar referensi lokasi kampus untuk filter dan formulir.

- **Respons `200 OK`:**
  ```json
  {
    "data": [
      { "id": 1, "name": "Ruang kelas" },
      { "id": 2, "name": "Laboratorium" }
    ]
  }
  ```

---

### `GET /reports`
Mengambil daftar laporan dengan dukungan pencarian, penyaringan, dan paginasi.

#### Query Parameters

| Parameter | Tipe | Wajib | Aturan & Default |
| --- | --- | --- | --- |
| `q` | `string` | Tidak | 1–100 karakter setelah `trim()`. Mencari substring pada `title` (*case-insensitive*) |
| `type` | `string` | Tidak | `LOST` atau `FOUND` |
| `categoryId` | `number` | Tidak | Bilangan bulat positif (`>= 1`) |
| `locationId` | `number` | Tidak | Bilangan bulat positif (`>= 1`) |
| `page` | `number` | Tidak | Bilangan bulat `>= 1` (default: `1`) |
| `limit` | `number` | Tidak | Bilangan bulat `1` sampai `50` (default: `12`) |

#### Respons `200 OK`
```json
{
  "data": [
    {
      "id": "0c7a3e18-5d2f-4b94-8a61-7e9b4c2d1f02",
      "type": "FOUND",
      "title": "KTM atas nama Dimas",
      "description": "KTM ditemukan di meja dekat pintu masuk. Bisa diambil dengan menyebutkan NPM.",
      "category": { "id": 1, "name": "KTM dan kartu identitas" },
      "location": { "id": 4, "name": "Perpustakaan" },
      "locationDetail": null,
      "eventDate": "2026-11-14",
      "photoUrl": "[https://res.cloudinary.com/demo/image/upload/sample.jpg](https://res.cloudinary.com/demo/image/upload/sample.jpg)",
      "contactMethod": "INSTAGRAM",
      "contactValue": "dimas.finder",
      "reporterName": null,
      "status": "ACTIVE",
      "createdAt": "2026-11-14T03:20:00.000Z",
      "updatedAt": "2026-11-14T03:20:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 12,
    "total": 1,
    "totalPages": 1
  }
}
```

#### Galat
- `400 INVALID_QUERY`: Jika ada parameter yang tidak dikenal atau nilainya melanggar aturan (misal `limit=100`, `page=0`, `type=OTHER`).

---

### `GET /reports/:id`
Mengambil detail satu laporan berdasarkan `id` (UUID).

- **Respons `200 OK`:**
  ```json
  {
    "data": {
      "id": "6b1f6a52-3c1b-4a7e-9c55-0d6a1f2e8b01",
      "type": "LOST",
      "title": "Tumbler biru Tupperware",
      "description": "Tumbler biru tutup putih, ada stiker kucing di badan. Tertinggal setelah kuliah pagi.",
      "category": { "id": 4, "name": "Botol minum" },
      "location": { "id": 1, "name": "Ruang kelas" },
      "locationDetail": "Ruang A206",
      "eventDate": "2026-11-12",
      "photoUrl": null,
      "contactMethod": "WHATSAPP",
      "contactValue": "6281234567890",
      "reporterName": "Rani",
      "status": "ACTIVE",
      "createdAt": "2026-11-12T08:15:00.000Z",
      "updatedAt": "2026-11-12T08:15:00.000Z"
    }
  }
  ```
- **Galat:**
  - `400 INVALID_QUERY`: Format `:id` bukan UUID valid.
  - `404 NOT_FOUND`: Laporan dengan UUID tersebut tidak ditemukan.

---

### `POST /reports`
Membuat laporan barang hilang atau ditemukan baru.

- **Content-Type:** `multipart/form-data`

#### Form Fields

| Field | Tipe | Wajib | Aturan |
| --- | --- | --- | --- |
| `type` | `string` | Ya | `LOST` atau `FOUND` |
| `title` | `string` | Ya | 3–100 karakter |
| `description` | `string` | Ya | 10–1000 karakter |
| `categoryId` | `string` (angka) | Ya | ID kategori yang valid |
| `locationId` | `string` (angka) | Ya | ID lokasi yang valid |
| `locationDetail` | `string` | Tidak | Maksimal 100 karakter |
| `eventDate` | `string` | Ya | Format `YYYY-MM-DD`, tidak boleh melebihi tanggal hari ini (WIB) |
| `contactMethod` | `string` | Ya | `WHATSAPP`, `LINE`, `INSTAGRAM`, atau `EMAIL` |
| `contactValue` | `string` | Ya | Sesuai format metode kontak yang dipilih |
| `reporterName` | `string` | Tidak | Maksimal 50 karakter |
| `photo` | `file` | Tidak | Maksimal 1 berkas (`image/jpeg`, `image/png`, `image/webp`), ukuran maks **5 MB** |

#### Contoh Request (`cURL`)
```bash
curl -X POST "http://localhost:3000/reports" \
  -F "type=FOUND" \
  -F "title=KTM atas nama Dimas" \
  -F "description=Ditemukan di meja dekat pintu masuk perpustakaan." \
  -F "categoryId=1" \
  -F "locationId=4" \
  -F "eventDate=2026-11-14" \
  -F "contactMethod=INSTAGRAM" \
  -F "contactValue=dimas.finder" \
  -F "photo=@ktm.jpg"
```

#### Respons `201 Created`
- **Header:** `Location: /reports/{id}`
- **Body:** `{ "data": { ...objek Report baru... } }`

---

### `GET /realtime/reports`
Mengambil konfigurasi WebSocket Neon Realtime dan query ter-seal (sealed live query) untuk langganan data live query laporan aktif di sisi frontend tanpa polling.

- **Respons `200 OK`:**
  ```json
  {
    "enabled": true,
    "url": "wss://ep-noisy-pond-a1op51hd.rt.c-1.ap-southeast-1.aws.neon.tech/",
    "branch": "production",
    "sealedQuery": {
      "capability": "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIiwidiI6Mn0...",
      "queryFingerprint": "bc5110f3f66a767cb6f771c409959e5a026b636729b905784014e7bc58737c94",
      "expiresAt": 1794852297000
    }
  }
  ```

---

## 3. Format Galat Seragam

Seluruh galat di semua endpoint dikembalikan dalam struktur JSON berikut:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Data laporan tidak valid",
    "details": [
      { "field": "title", "message": "Nama barang minimal 3 karakter" },
      { "field": "contactValue", "message": "Nomor WhatsApp belum benar. Tulis angka saja, misalnya 08123456789" }
    ]
  }
}
```

### Tabel Status HTTP & Kode Galat

| HTTP Status | `error.code` | Keterangan |
| --- | --- | --- |
| `400` | `VALIDATION_ERROR` | Input body `POST /reports` tidak lolos validasi |
| `400` | `INVALID_QUERY` | Parameter query `GET /reports` tidak valid atau `:id` bukan UUID |
| `404` | `NOT_FOUND` | ID laporan tidak ditemukan atau endpoint tidak terdaftar |
| `405` | `METHOD_NOT_ALLOWED` | Percobaan `PUT`, `PATCH`, atau `DELETE` pada `/reports` atau `/reports/:id` |
| `413` | `PAYLOAD_TOO_LARGE` | Ukuran berkas `photo` melebihi 5 MB |
| `415` | `UNSUPPORTED_MEDIA_TYPE` | Tipe berkas `photo` bukan JPEG, PNG, atau WebP |
| `502` | `UPLOAD_FAILED` | Layanan Cloudinary gagal mengunggah berkas |
| `500` | `INTERNAL_ERROR` | Kesalahan internal server tak terduga |