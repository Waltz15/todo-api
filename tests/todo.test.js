const request = require("supertest");
const app = require("../src/app");
const { registerAndLogin } = require("./helpers/auth");

describe("Todo Endpoints", () => {
  let token;

  beforeEach(async () => {
    token = await registerAndLogin();
  });

  describe("POST /api/todos", () => {
    it("should create a new todo when authenticated", async () => {
      const res = await request(app)
        .post("/api/todos")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Belajar Jest dan Supertest" });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.title).toBe("Belajar Jest dan Supertest");
      expect(res.body.data.completed).toBe(false);
    });

    it("should reject creating todo without authentication", async () => {
      const res = await request(app)
        .post("/api/todos")
        .send({ title: "Tanpa token" });

      expect(res.statusCode).toBe(401);
    });

    it("should reject title shorter than 3 characters", async () => {
      const res = await request(app)
        .post("/api/todos")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "ab" });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/between 3 and 100/i);
    });
  });

  describe("GET /api/todos", () => {
    it("should return todos that match the search query", async () => {
      // Bikin 3 todo dengan judul spesifik
      await request(app).post("/api/todos").set("Authorization", `Bearer ${token}`).send({ title: "Belajar memasak nasi" });
      await request(app).post("/api/todos").set("Authorization", `Bearer ${token}`).send({ title: "Makan nasi padang" });
      await request(app).post("/api/todos").set("Authorization", `Bearer ${token}`).send({ title: "Tidur siang" });

      // Lakukan pencarian dengan kata kunci "nasi"
      const res = await request(app)
        .get("/api/todos?search=nasi")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      // Harusnya cuma dapat 2 karena cuma 2 yang ada kata "nasi"
      expect(res.body.data.length).toBe(2); 
      
      // Pastikan Todo yang muncul emang mengandung kata "nasi"
      const titles = res.body.data.map(todo => todo.title.toLowerCase());
      expect(titles.some(title => title.includes("nasi"))).toBe(true);
    });
    it("should return paginated todos for the logged-in user", async () => {
      // Buat 3 todo terlebih dahulu
      for (let i = 1; i <= 3; i++) {
        await request(app)
          .post("/api/todos")
          .set("Authorization", `Bearer ${token}`)
          .send({ title: `Todo ke-${i}` });
      }

      const res = await request(app)
        .get("/api/todos?page=1&limit=2")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.pagination.totalItems).toBe(3);
      expect(res.body.pagination.totalPages).toBe(2);
    });

    it("should not return todos belonging to another user", async () => {
      await request(app)
        .post("/api/todos")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Todo milik Budi" });

      const otherToken = await registerAndLogin("siti@example.com");

      const res = await request(app)
        .get("/api/todos")
        .set("Authorization", `Bearer ${otherToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(0);
    });
  });

  describe("DELETE /api/todos/:id", () => {
    it("should not allow deleting another user's todo", async () => {
      const createRes = await request(app)
        .post("/api/todos")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Todo milik Budi" });

      const todoId = createRes.body.data._id;
      const otherToken = await registerAndLogin("siti@example.com");

      const res = await request(app)
        .delete(`/api/todos/${todoId}`)
        .set("Authorization", `Bearer ${otherToken}`);

      expect(res.statusCode).toBe(403);
    });

    it("should return 404 when deleting a non-existent todo", async () => {
      const fakeId = "665f1c2e8b1e2a1a2c3d9999";

      const res = await request(app)
        .delete(`/api/todos/${fakeId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
    });
  });

  describe("GET /api/todos sort & filter", () => {
    beforeEach(async () => {
      for (const title of ["Bbb todo", "Aaa todo", "Ccc todo"]) {
        await request(app).post("/api/todos").set("Authorization", `Bearer ${token}`).send({ title });
      }
    });

    it("should sort with ?sort=title (ascending)", async () => {
      const res = await request(app).get("/api/todos?sort=title").set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.map((t) => t.title)).toEqual(["Aaa todo", "Bbb todo", "Ccc todo"]);
    });

    it("should sort with ?sort=-title (descending)", async () => {
      const res = await request(app).get("/api/todos?sort=-title").set("Authorization", `Bearer ${token}`);

      expect(res.body.data.map((t) => t.title)).toEqual(["Ccc todo", "Bbb todo", "Aaa todo"]);
    });

    it("should reject an unknown sort field", async () => {
      const res = await request(app).get("/api/todos?sort=-password").set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(400);
    });

    it("should filter by ?status=completed and ?status=pending", async () => {
      const list = await request(app).get("/api/todos").set("Authorization", `Bearer ${token}`);
      await request(app)
        .put(`/api/todos/${list.body.data[0]._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ completed: true });

      const done = await request(app).get("/api/todos?status=completed").set("Authorization", `Bearer ${token}`);
      const pending = await request(app).get("/api/todos?status=pending").set("Authorization", `Bearer ${token}`);

      expect(done.body.data.length).toBe(1);
      expect(pending.body.data.length).toBe(2);
    });
  });

  describe("PUT /api/todos/:id/restore", () => {
    it("should not let another user restore (or change) someone else's todo", async () => {
      const createRes = await request(app)
        .post("/api/todos")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Todo milik Budi" });
      const todoId = createRes.body.data._id;
      await request(app).delete(`/api/todos/${todoId}`).set("Authorization", `Bearer ${token}`);

      const otherToken = await registerAndLogin("siti@example.com");
      const res = await request(app)
        .put(`/api/todos/${todoId}/restore`)
        .set("Authorization", `Bearer ${otherToken}`);
      expect(res.statusCode).toBe(403);

      // Todo harus tetap terarsip
      const getRes = await request(app).get(`/api/todos/${todoId}`).set("Authorization", `Bearer ${token}`);
      expect(getRes.statusCode).toBe(404);
    });
  });

  describe("DELETE /api/todos/:id/force", () => {
    it("should permanently delete a todo that is already archived", async () => {
      const createRes = await request(app)
        .post("/api/todos")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Todo diarsip" });
      const todoId = createRes.body.data._id;
      await request(app).delete(`/api/todos/${todoId}`).set("Authorization", `Bearer ${token}`);

      const res = await request(app)
        .delete(`/api/todos/${todoId}/force`)
        .set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toBe(200);

      const restoreRes = await request(app)
        .put(`/api/todos/${todoId}/restore`)
        .set("Authorization", `Bearer ${token}`);
      expect(restoreRes.statusCode).toBe(404);
    });
  });
});
