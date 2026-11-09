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
- [Referensi Endpoint](#referensi-endpoint)

## Fitur

- **Autentikasi & Otorisasi:** Register & Login dengan JSON Web Token (JWT) dan role-based access.
- **Manajemen Todo & Kategori:** CRUD Todo List dan Categories.
- **Advanced Data Management:** Soft Delete, Restore Todo, dan Hard Delete.
- **Advanced Query:** Pagination, Search, Filtering, dan Sorting.
- **Activity Log:** Mencatat riwayat aktivitas ke database secara otomatis.
- **Protected Stats:** Endpoint ringkasan statistik yang dilindungi API Key khusus.
- **Keamanan & Validasi:** Global error handling dan validasi input ketat dengan `express-validator`.
- **Testing:** Unit dan Integration test menggunakan `jest`, `supertest`, dan `mongodb-memory-server`.
- **Dokumentasi:** Dokumentasi API interaktif dengan Swagger UI.

## Teknologi yang Dipakai

- **Core:** Node.js, Express.js (^5.3.0)
- **Database:** MongoDB, Mongoose (^7.6.3)
- **Security:** bcryptjs, jsonwebtoken, dotenv
- **Validation:** express-validator
- **Testing:** jest, supertest, mongodb-memory-server
- **Dokumentasi:** swagger-jsdoc, swagger-ui-express

## Struktur Project

```text
todo-api/
├── src/
│   ├── config/        # Konfigurasi database
│   ├── controllers/   # admin, auth, category, stats, todo
│   ├── middlewares/   # apiKey, auth, errorHandler, logger, restrictTo, dll
│   ├── models/        # activityLog, category, todo, user
│   ├── routes/        # Router untuk tiap endpoint
│   ├── services/      # Business logic (auth & todo)
│   ├── utils/         # Utility functions tambahan
│   ├── validators/    # Skema validasi input
│   ├── app.js         # Setup utama Express
│   ├── server.js      # Entry point aplikasi
│   └── swagger.js     # Konfigurasi Swagger UI
└── tests/             # File automated test (auth, stats, todo)