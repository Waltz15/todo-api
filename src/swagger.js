const swaggerUi = require("swagger-ui-express");

// ===== Helper untuk mengurangi pengulangan =====
const ref = (name) => ({ $ref: `#/components/schemas/${name}` });
const json = (schema) => ({ "application/json": { schema } });
const idParam = (name = "id", description = "MongoDB ObjectId") => ({
  name,
  in: "path",
  required: true,
  description,
  schema: { type: "string", example: "665f1c2e8b1e2a1a2c3d4e5f" },
});
const success = (description, dataSchema) => ({
  description,
  content: json({
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string", example: description },
      ...(dataSchema ? { data: dataSchema } : {}),
    },
  }),
});
const paginated = (description, itemSchema) => ({
  description,
  content: json({
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string", example: description },
      data: { type: "array", items: itemSchema },
      pagination: ref("Pagination"),
    },
  }),
});
const errorResponse = (description, example) => ({
  description,
  content: json({ allOf: [ref("ErrorResponse")], example: { success: false, message: example } }),
});

const err400 = errorResponse("Validasi gagal", "Invalid todo ID format");
const err401 = errorResponse("Belum login / token tidak valid", "You are not logged in. Please log in to get access");
const err403 = errorResponse("Tidak punya akses", "You do not have permission to access this todo");
const err404 = (msg) => errorResponse("Data tidak ditemukan", msg);

const pageParams = [
  { name: "page", in: "query", description: "Nomor halaman (min 1)", schema: { type: "integer", minimum: 1, default: 1 } },
  { name: "limit", in: "query", description: "Jumlah data per halaman (1-100)", schema: { type: "integer", minimum: 1, maximum: 100, default: 10 } },
];

const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Todo API Documentation",
    version: "1.1.0",
    description:
      "Dokumentasi interaktif Todo API - Production Stage 2.\n\n" +
      "**Cara pakai:** register/login untuk mendapatkan token, klik tombol **Authorize**, lalu isi `bearerAuth` dengan token tersebut. " +
      "Endpoint `/api/stats/summary` memakai header `x-api-key` (`ApiKeyAuth`).",
  },
  servers: [
    { url: "https://todo-api-hadi-azka.vercel.app", description: "Production Server Vercel" },
    { url: "http://localhost:3000", description: "Development Server" },
  ],
  tags: [
    { name: "Auth", description: "Register & login (JWT)" },
    { name: "Categories", description: "CRUD kategori milik user (soft delete, restore, hard delete)" },
    { name: "Todos", description: "CRUD todo milik user + relasi kategori, search, filter, sort, pagination" },
    { name: "Activity Logs", description: "Riwayat aktivitas (user: miliknya sendiri, admin: semua)" },
    { name: "Stats", description: "Endpoint eksternal dengan API Key" },
    { name: "Admin", description: "Khusus role admin" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      ApiKeyAuth: { type: "apiKey", in: "header", name: "x-api-key" },
    },
    schemas: {
      ObjectId: { type: "string", example: "665f1c2e8b1e2a1a2c3d4e5f" },
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Error message" },
        },
      },
      Pagination: {
        type: "object",
        properties: {
          currentPage: { type: "integer", example: 1 },
          totalPages: { type: "integer", example: 3 },
          totalItems: { type: "integer", example: 25 },
          itemsPerPage: { type: "integer", example: 10 },
        },
      },
      User: {
        type: "object",
        properties: {
          id: ref("ObjectId"),
          name: { type: "string", example: "Budi" },
          email: { type: "string", format: "email", example: "budi@example.com" },
          role: { type: "string", enum: ["user", "admin"], example: "user" },
        },
      },
      RegisterInput: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", example: "Budi" },
          email: { type: "string", format: "email", example: "budi@example.com" },
          password: { type: "string", minLength: 12, example: "rahasia1234567" },
          secret_key: { type: "string", description: "Opsional. Isi dengan ADMIN_SECRET_KEY untuk mendaftar sebagai admin" },
        },
      },
      LoginInput: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "budi@example.com" },
          password: { type: "string", example: "rahasia1234567" },
        },
      },
      AuthResult: {
        type: "object",
        properties: {
          user: ref("User"),
          token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
        },
      },
      Category: {
        type: "object",
        properties: {
          _id: ref("ObjectId"),
          name: { type: "string", example: "Pekerjaan" },
          description: { type: "string", example: "Tugas kantor" },
          created_by: ref("ObjectId"),
          updated_by: { allOf: [ref("ObjectId")], nullable: true },
          archived: { type: "boolean", example: false },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      CategoryInput: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", maxLength: 50, example: "Pekerjaan" },
          description: { type: "string", maxLength: 255, example: "Tugas kantor" },
        },
      },
      CategorySummary: {
        type: "object",
        nullable: true,
        properties: {
          _id: ref("ObjectId"),
          name: { type: "string", example: "Pekerjaan" },
        },
      },
      Todo: {
        type: "object",
        properties: {
          _id: ref("ObjectId"),
          title: { type: "string", example: "Belajar Swagger" },
          description: { type: "string", example: "Tugas Stage 2" },
          category_id: ref("CategorySummary"),
          completed: { type: "boolean", example: false },
          created_by: ref("ObjectId"),
          updated_by: { allOf: [ref("ObjectId")], nullable: true },
          archived: { type: "boolean", example: false },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      TodoCreateInput: {
        type: "object",
        required: ["title"],
        properties: {
          title: { type: "string", minLength: 3, maxLength: 100, example: "Belajar Swagger" },
          description: { type: "string", maxLength: 500, example: "Tugas Stage 2" },
          category_id: {
            type: "string",
            nullable: true,
            example: "665f1c2e8b1e2a1a2c3d4e5f",
            description: "Opsional. ID kategori milik user (boleh juga dikirim dengan nama field `category`).",
          },
        },
      },
      TodoUpdateInput: {
        type: "object",
        properties: {
          title: { type: "string", minLength: 3, maxLength: 100, example: "Belajar Swagger Selesai" },
          description: { type: "string", maxLength: 500 },
          completed: { type: "boolean", example: true },
          category_id: {
            type: "string",
            nullable: true,
            example: "665f1c2e8b1e2a1a2c3d4e5f",
            description: "ID kategori baru, atau `null` untuk melepas kategori. Alias: `category`.",
          },
        },
      },
      ActivityLog: {
        type: "object",
        properties: {
          _id: ref("ObjectId"),
          action: { type: "string", enum: ["CREATE", "UPDATE", "ARCHIVE", "RESTORE", "LOGIN", "REGISTER", "HARD_DELETE"], example: "CREATE" },
          resource: { type: "string", enum: ["Todo", "Category", "User", "Auth"], example: "Todo" },
          resource_id: { allOf: [ref("ObjectId")], nullable: true },
          user_id: {
            type: "object",
            properties: {
              _id: ref("ObjectId"),
              name: { type: "string", example: "Budi" },
              email: { type: "string", example: "budi@example.com" },
            },
          },
          details: { type: "string", example: "Membuat todo baru: Belajar Swagger" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Stats: {
        type: "object",
        properties: {
          totalTodos: { type: "integer", example: 10 },
          completedTodos: { type: "integer", example: 4 },
          pendingTodos: { type: "integer", example: 6 },
        },
      },
    },
  },
  paths: {
    // ================= AUTH =================
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register akun baru",
        requestBody: { required: true, content: json(ref("RegisterInput")) },
        responses: {
          201: success("User registered successfully", ref("AuthResult")),
          400: errorResponse("Field wajib kosong", "Name, email, and password are required"),
          409: errorResponse("Email sudah terdaftar", "Email is already registered"),
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login user",
        requestBody: { required: true, content: json(ref("LoginInput")) },
        responses: {
          200: success("Login Successful", ref("AuthResult")),
          400: errorResponse("Field wajib kosong", "Email and Password are required"),
          401: errorResponse("Email/password salah", "Invalid email or password"),
        },
      },
    },

    // ================= CATEGORIES =================
    "/api/categories": {
      post: {
        tags: ["Categories"],
        summary: "Buat Category baru",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: json(ref("CategoryInput")) },
        responses: {
          201: success("Category created successfully", ref("Category")),
          400: errorResponse("Validasi gagal", "Category name is required"),
          401: err401,
        },
      },
      get: {
        tags: ["Categories"],
        summary: "Ambil semua Category milik user (yang tidak diarsip)",
        security: [{ bearerAuth: [] }],
        responses: {
          200: success("Categories retrieved successfully", { type: "array", items: ref("Category") }),
          401: err401,
        },
      },
    },
    "/api/categories/{id}": {
      get: {
        tags: ["Categories"],
        summary: "Ambil Category berdasarkan ID",
        security: [{ bearerAuth: [] }],
        parameters: [idParam()],
        responses: {
          200: success("Category retrieved successfully", ref("Category")),
          400: errorResponse("ID tidak valid", "Invalid category ID format"),
          401: err401,
          404: err404("Category not found"),
        },
      },
      put: {
        tags: ["Categories"],
        summary: "Update Category (mengisi updated_by)",
        security: [{ bearerAuth: [] }],
        parameters: [idParam()],
        requestBody: { content: json(ref("CategoryInput")) },
        responses: {
          200: success("Category updated successfully", ref("Category")),
          400: errorResponse("Validasi gagal", "Invalid category ID format"),
          401: err401,
          404: err404("Category not found"),
        },
      },
      delete: {
        tags: ["Categories"],
        summary: "Soft Delete Category (archived: true)",
        security: [{ bearerAuth: [] }],
        parameters: [idParam()],
        responses: {
          200: success("Category deleted successfully", ref("Category")),
          400: errorResponse("ID tidak valid", "Invalid category ID format"),
          401: err401,
          404: err404("Category not found"),
        },
      },
    },
    "/api/categories/{id}/restore": {
      put: {
        tags: ["Categories"],
        summary: "Restore Category yang di Soft Delete",
        security: [{ bearerAuth: [] }],
        parameters: [idParam()],
        responses: {
          200: success("Category restored successfully", ref("Category")),
          401: err401,
          404: err404("Category not found in archive"),
        },
      },
    },
    "/api/categories/{id}/force": {
      delete: {
        tags: ["Categories"],
        summary: "Hard Delete Category (Permanen) — relasi kategori pada todo akan dilepas (null)",
        security: [{ bearerAuth: [] }],
        parameters: [idParam()],
        responses: {
          200: success("Category permanently deleted from database"),
          401: err401,
          404: err404("Category not found"),
        },
      },
    },

    // ================= TODOS =================
    "/api/todos": {
      post: {
        tags: ["Todos"],
        summary: "Buat Todo baru (opsional dengan kategori)",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: json(ref("TodoCreateInput")) },
        responses: {
          201: success("Todo created successfully", ref("Todo")),
          400: errorResponse("Validasi gagal", "Title must be between 3 and 100 characters"),
          401: err401,
          404: err404("Category not found"),
        },
      },
      get: {
        tags: ["Todos"],
        summary: "Ambil semua Todo (search, filter, sort, pagination)",
        description: "User biasa hanya melihat todo miliknya. Admin melihat semua todo.",
        security: [{ bearerAuth: [] }],
        parameters: [
          ...pageParams,
          { name: "search", in: "query", description: "Cari berdasarkan title (case-insensitive)", schema: { type: "string", example: "belajar" } },
          { name: "status", in: "query", description: "Filter status todo", schema: { type: "string", enum: ["completed", "pending"] } },
          { name: "completed", in: "query", description: "Filter status (alternatif dari `status`)", schema: { type: "boolean" } },
          { name: "category", in: "query", description: "Filter berdasarkan ID kategori", schema: { type: "string" } },
          {
            name: "sort",
            in: "query",
            description: "Urutkan data. Awalan `-` = descending. Contoh: `-createdAt`, `title`",
            schema: {
              type: "string",
              enum: ["createdAt", "-createdAt", "updatedAt", "-updatedAt", "title", "-title", "completed", "-completed"],
            },
          },
          { name: "sortBy", in: "query", description: "Alternatif `sort`: nama field", schema: { type: "string", enum: ["createdAt", "updatedAt", "title", "completed"] } },
          { name: "order", in: "query", description: "Dipakai bersama `sortBy`", schema: { type: "string", enum: ["asc", "desc"], default: "desc" } },
        ],
        responses: {
          200: paginated("Todos retrieved successfully", ref("Todo")),
          400: errorResponse("Query tidak valid", "Page must be a positive integer"),
          401: err401,
        },
      },
    },
    "/api/todos/{id}": {
      get: {
        tags: ["Todos"],
        summary: "Ambil Todo berdasarkan ID",
        security: [{ bearerAuth: [] }],
        parameters: [idParam()],
        responses: {
          200: success("Todo retrieved successfully", ref("Todo")),
          400: err400,
          401: err401,
          403: err403,
          404: err404("Todo not found"),
        },
      },
      put: {
        tags: ["Todos"],
        summary: "Update data Todo (termasuk kategori)",
        security: [{ bearerAuth: [] }],
        parameters: [idParam()],
        requestBody: { content: json(ref("TodoUpdateInput")) },
        responses: {
          200: success("Todo updated successfully", ref("Todo")),
          400: err400,
          401: err401,
          403: err403,
          404: err404("Todo not found / Category not found"),
        },
      },
      delete: {
        tags: ["Todos"],
        summary: "Soft Delete Todo (archived: true)",
        security: [{ bearerAuth: [] }],
        parameters: [idParam()],
        responses: {
          200: success("Todo deleted successfully", ref("Todo")),
          400: err400,
          401: err401,
          403: err403,
          404: err404("Todo not found"),
        },
      },
    },
    "/api/todos/{id}/restore": {
      put: {
        tags: ["Todos"],
        summary: "Restore Todo yang di Soft Delete",
        security: [{ bearerAuth: [] }],
        parameters: [idParam()],
        responses: {
          200: success("Todo restored successfully", ref("Todo")),
          401: err401,
          403: err403,
          404: err404("Todo not found in archive"),
        },
      },
    },
    "/api/todos/{id}/force": {
      delete: {
        tags: ["Todos"],
        summary: "Hard Delete Todo (Permanen, termasuk todo yang sudah diarsip)",
        security: [{ bearerAuth: [] }],
        parameters: [idParam()],
        responses: {
          200: success("Todo permanently deleted from database"),
          401: err401,
          403: err403,
          404: err404("Todo not found"),
        },
      },
    },

    // ================= ACTIVITY LOGS =================
    "/api/activity-logs": {
      get: {
        tags: ["Activity Logs"],
        summary: "Ambil riwayat aktivitas",
        description:
          "User biasa hanya melihat riwayat aktivitas miliknya sendiri. Admin melihat semua aktivitas dan bisa memfilter dengan `user_id`.\n\n" +
          "Aktivitas yang dicatat: REGISTER, LOGIN, serta CREATE / UPDATE / ARCHIVE / RESTORE / HARD_DELETE pada Todo dan Category.",
        security: [{ bearerAuth: [] }],
        parameters: [
          ...pageParams,
          { name: "action", in: "query", schema: { type: "string", enum: ["CREATE", "UPDATE", "ARCHIVE", "RESTORE", "LOGIN", "REGISTER", "HARD_DELETE"] } },
          { name: "resource", in: "query", schema: { type: "string", enum: ["Todo", "Category", "User", "Auth"] } },
          { name: "order", in: "query", description: "Urutan berdasarkan waktu", schema: { type: "string", enum: ["asc", "desc"], default: "desc" } },
          { name: "user_id", in: "query", description: "Khusus admin: filter berdasarkan user", schema: { type: "string" } },
        ],
        responses: {
          200: paginated("Activity logs retrieved successfully", ref("ActivityLog")),
          400: errorResponse("Query tidak valid", "Invalid action filter"),
          401: err401,
        },
      },
    },

    // ================= STATS =================
    "/api/stats/summary": {
      get: {
        tags: ["Stats"],
        summary: "Ambil kalkulasi Summary Stats",
        security: [{ ApiKeyAuth: [] }],
        responses: {
          200: success("Summary retrieved successfully", ref("Stats")),
          401: errorResponse("API key tidak ada / salah", "Invalid API key"),
        },
      },
    },

    // ================= ADMIN =================
    "/api/admin/dashboard": {
      get: {
        tags: ["Admin"],
        summary: "Dashboard admin: statistik + 20 aktivitas terbaru",
        security: [{ bearerAuth: [] }],
        responses: {
          200: success("Data dashboard admin berhasil ditarik", {
            type: "object",
            properties: {
              stats: ref("Stats"),
              recentLogs: { type: "array", items: ref("ActivityLog") },
            },
          }),
          401: err401,
          403: errorResponse("Bukan admin", "Akses ditolak! Fitur ini khusus Admin."),
        },
      },
    },
  },
};

const setupSwagger = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};

module.exports = setupSwagger;
module.exports.swaggerDocument = swaggerDocument;
