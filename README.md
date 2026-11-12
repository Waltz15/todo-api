# Todo List API

API backend profesional untuk manajemen Todo List dan Kategori. Dibangun dengan arsitektur terstruktur untuk memenuhi standar Production Stage 2, dilengkapi dengan autentikasi JWT, proteksi API Key, Soft Delete, validasi input, automated testing, dan dokumentasi interaktif.

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/-MongoDB-4DB33D?style=flat&logo=mongodb&logoColor=FFFFFF)
![Tests](https://img.shields.io/badge/tests-passing-brightgreen)

## Daftar Isi

- [Fitur](#fitur)
- [Teknologi yang Dipakai](#teknologi-yang-dipakai)
- [Struktur Project](#struktur-project)
- [Persyaratan](#persyaratan)
- [Instalasi](#instalasi)
- [Environment Variables](#environment-variables)
- [Menjalankan Project](#menjalankan-project)
- [Menjalankan Test](#menjalankan-test)
- [Dokumentasi API (Swagger)](#dokumentasi-api-swagger)
- [Referensi Endpoint](#referensi-endpoint)
- [Deploy ke Vercel](#deploy-ke-vercel)

## Fitur

- **Autentikasi & Otorisasi:** Register & Login dengan JSON Web Token (JWT) dan role-based access (`user` / `admin`).
- **Manajemen Todo & Kategori:** CRUD Todo dan Category, termasuk relasi Todo → Category.
- **Advanced Data Management:** Soft Delete, Restore, dan Hard Delete untuk Todo maupun Category.
- **Field wajib dokumen:** `created_by`, `updated_by`, dan `archived` pada Todo dan Category.
- **Advanced Query:** Pagination, Search, Filtering (status & kategori), dan Sorting.
- **Activity Log:** Setiap register, login, dan perubahan Todo/Category dicatat otomatis. User bisa melihat riwayatnya sendiri, admin bisa melihat semua.
- **Protected Stats:** Endpoint ringkasan statistik yang dilindungi API Key khusus.
- **Keamanan & Validasi:** Global error handling (tanpa membocorkan stack trace) dan validasi input dengan `express-validator`.
- **Testing:** Integration test menggunakan `jest`, `supertest`, dan `mongodb-memory-server`.
- **Dokumentasi:** Dokumentasi API interaktif dengan Swagger UI, lengkap dengan schema request/response.

## Teknologi yang Dipakai

- **Core:** Node.js, Express.js (^5.3.0)
- **Database:** MongoDB, Mongoose (^7.6.3)
- **Security:** bcryptjs, jsonwebtoken, dotenv
- **Validation:** express-validator
- **Testing:** jest, supertest, mongodb-memory-server
- **Dokumentasi:** swagger-ui-express

## Struktur Project

```text
todo-api/
├── api/
│   └── index.js       # Entry point Vercel Serverless Function
├── src/
│   ├── config/        # Konfigurasi koneksi database
│   ├── controllers/   # activityLog, admin, auth, category, stats, todo
│   ├── middlewares/   # apiKey, auth, errorHandler, logger, notFound, validate, dll
│   ├── models/        # activityLog, category, todo, user
│   ├── routes/        # Router untuk tiap endpoint
│   ├── services/      # Business logic (activityLog, auth, category, todo)
│   ├── utils/         # AppError, catchAsync, logActivity
│   ├── validators/    # Aturan validasi input (todo, category, activityLog)
│   ├── app.js         # Setup utama Express
│   ├── server.js      # Entry point untuk menjalankan server lokal
│   └── swagger.js     # Spesifikasi OpenAPI & Swagger UI
├── tests/             # Automated test (auth, todo, category, activityLog, stats)
├── .env.example       # Contoh konfigurasi environment
├── .env.test.example  # Contoh konfigurasi untuk test (opsional)
└── vercel.json        # Konfigurasi deploy Vercel
```

## Persyaratan

- [Node.js](https://nodejs.org/) versi 18 atau lebih baru
- npm (sudah termasuk saat install Node.js)
- MongoDB, salah satu dari:
  - MongoDB lokal (MongoDB Community Server), atau
  - [MongoDB Atlas](https://www.mongodb.com/atlas) (cloud, ada paket gratis)
- Git

## Instalasi

1. Clone repository:

   ```bash
   git clone https://github.com/Waltz15/todo-api.git
   cd todo-api
   ```

2. Install dependency:

   ```bash
   npm install
   ```

3. Salin file contoh environment, lalu isi nilainya (lihat bagian [Environment Variables](#environment-variables)):

   ```bash
   cp .env.example .env
   ```

   Di Windows (Command Prompt) gunakan `copy .env.example .env`.

## Environment Variables

Semua konfigurasi disimpan di file `.env` (file ini **tidak** di-commit ke Git).

| Variable | Wajib | Contoh | Keterangan |
|---|---|---|---|
| `PORT` | Tidak | `3000` | Port server lokal (default `3000`) |
| `MONGODB_URI` | Ya | `mongodb://127.0.0.1:27017/todo_api_db` | Connection string MongoDB lokal atau Atlas |
| `NODE_ENV` | Tidak | `development` | `development`, `production`, atau `test` |
| `JWT_SECRET` | Ya | `string-acak-yang-panjang` | Kunci rahasia untuk menandatangani token JWT |
| `JWT_EXPIRES_IN` | Ya | `1d` | Masa berlaku token (contoh: `1h`, `1d`, `7d`) |
| `EXTERNAL_API_KEY` | Ya | `string-acak-yang-panjang` | API Key untuk endpoint `/api/stats/summary` (header `x-api-key`) |
| `ADMIN_SECRET_KEY` | Ya | `string-acak-yang-panjang` | Kunci untuk mendaftar sebagai admin (field `secret_key` saat register) |

Contoh isi `.env`:

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/todo_api_db
NODE_ENV=development
JWT_SECRET=ganti_dengan_string_acak_panjang
JWT_EXPIRES_IN=1d
EXTERNAL_API_KEY=ganti_dengan_api_key_rahasia
ADMIN_SECRET_KEY=ganti_dengan_kunci_admin_rahasia
```

Tips membuat string acak:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Menjalankan Project

Pastikan MongoDB sudah berjalan (atau `MONGODB_URI` mengarah ke Atlas), lalu:

**Mode development** (auto-restart dengan nodemon):

```bash
npm run dev
```

**Mode production:**

```bash
npm start
```

Jika berhasil, terminal menampilkan:

```text
MongoDB connected succesfully
Server running on http://localhost:3000
Environment: development
```

Cek server dengan membuka `http://localhost:3000` → `{ "message": "Todo API is running" }`.

### Membuat akun admin

Kirim field `secret_key` yang sama dengan `ADMIN_SECRET_KEY` saat register:

```json
POST /api/auth/register
{
  "name": "Admin",
  "email": "admin@example.com",
  "password": "passwordminimal12",
  "secret_key": "<isi ADMIN_SECRET_KEY>"
}
```

## Menjalankan Test

Test memakai database MongoDB in-memory (`mongodb-memory-server`), jadi **tidak** mengganggu database asli.

Test bisa langsung dijalankan **tanpa** file `.env.test`, karena `tests/setup.js` sudah menyediakan nilai default khusus test. Jika ingin memakai nilai sendiri, salin file contohnya (file `.env.test` tidak di-commit ke Git):

```bash
cp .env.test.example .env.test
```

> Jangan pernah mengisi `.env.test` dengan kredensial production.

Jalankan:

```bash
npm test
```

> Saat pertama kali dijalankan, `mongodb-memory-server` akan mengunduh binary MongoDB (butuh koneksi internet), jadi bisa memakan waktu beberapa menit.

## Dokumentasi API (Swagger)

- Lokal: `http://localhost:3000/api-docs`
- Production: https://todo-api-hadi-azka.vercel.app/api-docs/

Cara mencoba endpoint yang butuh login:

1. Jalankan `POST /api/auth/login` dan salin `token` dari respons.
2. Klik tombol **Authorize**, isi `bearerAuth` dengan token tersebut.
3. Untuk `/api/stats/summary`, isi `ApiKeyAuth` dengan nilai `EXTERNAL_API_KEY`.

## Referensi Endpoint

Semua endpoint (kecuali auth dan stats) membutuhkan header `Authorization: Bearer <token>`.

### Auth

| Method | Endpoint | Keterangan |
|---|---|---|
| POST | `/api/auth/register` | Register user baru (password minimal 12 karakter) |
| POST | `/api/auth/login` | Login, mengembalikan token JWT |

### Categories

| Method | Endpoint | Keterangan |
|---|---|---|
| POST | `/api/categories` | Buat kategori |
| GET | `/api/categories` | List kategori milik user (yang tidak diarsip) |
| GET | `/api/categories/:id` | Detail kategori |
| PUT | `/api/categories/:id` | Update kategori (mengisi `updated_by`) |
| DELETE | `/api/categories/:id` | Soft delete (`archived: true`) |
| PUT | `/api/categories/:id/restore` | Restore kategori yang diarsip |
| DELETE | `/api/categories/:id/force` | Hapus permanen (todo yang memakai kategori ini menjadi tanpa kategori) |

### Todos

| Method | Endpoint | Keterangan |
|---|---|---|
| POST | `/api/todos` | Buat todo (`title`, `description`, `category_id` opsional) |
| GET | `/api/todos` | List todo (user: miliknya, admin: semua) |
| GET | `/api/todos/:id` | Detail todo |
| PUT | `/api/todos/:id` | Update todo (`title`, `description`, `completed`, `category_id`) |
| DELETE | `/api/todos/:id` | Soft delete (`archived: true`) |
| PUT | `/api/todos/:id/restore` | Restore todo yang diarsip |
| DELETE | `/api/todos/:id/force` | Hapus permanen |

Relasi kategori: kirim `category_id` (atau alias `category`) berisi ID kategori milik user. Format ID salah → `400`, kategori tidak ada / bukan milik user / diarsip → `404`. Kirim `category_id: null` saat update untuk melepas kategori.

Query parameter `GET /api/todos`:

| Parameter | Contoh | Keterangan |
|---|---|---|
| `page` | `1` | Halaman (default `1`) |
| `limit` | `10` | Data per halaman, 1–100 (default `10`) |
| `search` | `belajar` | Cari berdasarkan title |
| `status` | `completed` / `pending` | Filter status |
| `completed` | `true` / `false` | Alternatif filter status |
| `category` | `<categoryId>` | Filter berdasarkan kategori |
| `sort` | `-createdAt`, `title` | Urutan; awalan `-` = descending. Field: `createdAt`, `updatedAt`, `title`, `completed` |
| `sortBy` + `order` | `sortBy=title&order=asc` | Alternatif dari `sort` |

Contoh: `GET /api/todos?status=pending&category=665f...&sort=-createdAt&page=1&limit=5`

### Activity Logs

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/api/activity-logs` | User: riwayat miliknya sendiri. Admin: semua riwayat |

Query parameter: `page`, `limit`, `action` (`CREATE`, `UPDATE`, `ARCHIVE`, `RESTORE`, `HARD_DELETE`, `REGISTER`, `LOGIN`), `resource` (`Todo`, `Category`, `Auth`), `order` (`asc`/`desc`), dan `user_id` (khusus admin).

### Stats & Admin

| Method | Endpoint | Auth | Keterangan |
|---|---|---|---|
| GET | `/api/stats/summary` | Header `x-api-key` | Total, completed, dan pending todo |
| GET | `/api/admin/dashboard` | Bearer token (admin) | Statistik + 20 aktivitas terbaru |

### Format Respons

Sukses:

```json
{ "success": true, "message": "Todos retrieved successfully", "data": [], "pagination": { "currentPage": 1, "totalPages": 1, "totalItems": 0, "itemsPerPage": 10 } }
```

Error (tanpa stack trace):

```json
{ "success": false, "message": "Todo not found" }
```

| Status | Arti |
|---|---|
| `400` | Input / query tidak valid |
| `401` | Belum login, token tidak valid, atau API key salah |
| `403` | Tidak punya akses (bukan pemilik / bukan admin) |
| `404` | Data atau route tidak ditemukan |
| `409` | Data duplikat (misal email sudah terdaftar) |
| `500` | Kesalahan server |

## Deploy ke Vercel

Project sudah memiliki `api/index.js` dan `vercel.json` sehingga bisa langsung di-deploy:

1. Import repository ini di [Vercel](https://vercel.com/new).
2. Isi semua environment variable (`MONGODB_URI` memakai MongoDB Atlas, `JWT_SECRET`, `JWT_EXPIRES_IN`, `EXTERNAL_API_KEY`, `ADMIN_SECRET_KEY`) di **Project Settings → Environment Variables**.
3. Di MongoDB Atlas, izinkan akses jaringan dari Vercel (**Network Access → Allow access from anywhere** / `0.0.0.0/0`).
4. Deploy. Swagger tersedia di `https://<domain-vercel>/api-docs`.
