const request = require("supertest");
const app = require("../src/app");
const { registerAndLogin } = require("./helpers/auth");

const auth = (token) => ({ Authorization: `Bearer ${token}` });

async function createCategory(token, name = "Pekerjaan") {
  const res = await request(app).post("/api/categories").set(auth(token)).send({ name });
  return res.body.data;
}

describe("Category Endpoints", () => {
  let token;

  beforeEach(async () => {
    token = await registerAndLogin();
  });

  it("should create a category with created_by, updated_by and archived fields", async () => {
    const res = await request(app)
      .post("/api/categories")
      .set(auth(token))
      .send({ name: "Pekerjaan" });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.created_by).toBeDefined();
    expect(res.body.data.updated_by).toBeNull();
    expect(res.body.data.archived).toBe(false);
  });

  it("should reject a category without name", async () => {
    const res = await request(app).post("/api/categories").set(auth(token)).send({});
    expect(res.statusCode).toBe(400);
  });

  it("should return 400 for an invalid category id", async () => {
    const res = await request(app).get("/api/categories/bukan-id").set(auth(token));
    expect(res.statusCode).toBe(400);
  });

  it("should fill updated_by when a category is updated", async () => {
    const category = await createCategory(token);

    const res = await request(app)
      .put(`/api/categories/${category._id}`)
      .set(auth(token))
      .send({ name: "Pekerjaan Rumah" });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.name).toBe("Pekerjaan Rumah");
    expect(res.body.data.updated_by).toBe(category.created_by);
  });

  it("should soft delete, restore, and hard delete a category", async () => {
    const category = await createCategory(token);

    const delRes = await request(app).delete(`/api/categories/${category._id}`).set(auth(token));
    expect(delRes.statusCode).toBe(200);
    expect(delRes.body.data.archived).toBe(true);

    const getRes = await request(app).get(`/api/categories/${category._id}`).set(auth(token));
    expect(getRes.statusCode).toBe(404);

    const listRes = await request(app).get("/api/categories").set(auth(token));
    expect(listRes.body.data.length).toBe(0);

    const restoreRes = await request(app)
      .put(`/api/categories/${category._id}/restore`)
      .set(auth(token));
    expect(restoreRes.statusCode).toBe(200);
    expect(restoreRes.body.data.archived).toBe(false);

    const forceRes = await request(app)
      .delete(`/api/categories/${category._id}/force`)
      .set(auth(token));
    expect(forceRes.statusCode).toBe(200);

    const afterForce = await request(app).get(`/api/categories/${category._id}`).set(auth(token));
    expect(afterForce.statusCode).toBe(404);
  });

  it("should not allow access to another user's category", async () => {
    const category = await createCategory(token);
    const otherToken = await registerAndLogin("siti@example.com");

    const res = await request(app).get(`/api/categories/${category._id}`).set(auth(otherToken));
    expect(res.statusCode).toBe(404);
  });
});

describe("Todo -> Category relation", () => {
  let token;
  let category;

  beforeEach(async () => {
    token = await registerAndLogin();
    category = await createCategory(token);
  });

  it("should save category_id when creating a todo", async () => {
    const res = await request(app)
      .post("/api/todos")
      .set(auth(token))
      .send({ title: "Todo berkategori", category_id: category._id });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.category_id._id).toBe(category._id);
    expect(res.body.data.category_id.name).toBe("Pekerjaan");

    const getRes = await request(app).get(`/api/todos/${res.body.data._id}`).set(auth(token));
    expect(getRes.body.data.category_id._id).toBe(category._id);
  });

  it("should accept the 'category' alias field", async () => {
    const res = await request(app)
      .post("/api/todos")
      .set(auth(token))
      .send({ title: "Todo berkategori", category: category._id });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.category_id._id).toBe(category._id);
  });

  it("should create a todo without category", async () => {
    const res = await request(app).post("/api/todos").set(auth(token)).send({ title: "Tanpa kategori" });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.category_id).toBeNull();
  });

  it("should return 400 for an invalid category id format", async () => {
    const res = await request(app)
      .post("/api/todos")
      .set(auth(token))
      .send({ title: "Todo ngawur", category_id: "ngawur" });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/invalid category id/i);
  });

  it("should return 404 for a category that does not exist", async () => {
    const res = await request(app)
      .post("/api/todos")
      .set(auth(token))
      .send({ title: "Todo ngawur", category_id: "665f1c2e8b1e2a1a2c3d9999" });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/category not found/i);
  });

  it("should return 404 when using another user's category", async () => {
    const otherToken = await registerAndLogin("siti@example.com");

    const res = await request(app)
      .post("/api/todos")
      .set(auth(otherToken))
      .send({ title: "Pakai kategori orang", category_id: category._id });

    expect(res.statusCode).toBe(404);
  });

  it("should update and remove the category of a todo", async () => {
    const createRes = await request(app).post("/api/todos").set(auth(token)).send({ title: "Todo biasa" });
    const todoId = createRes.body.data._id;

    const updateRes = await request(app)
      .put(`/api/todos/${todoId}`)
      .set(auth(token))
      .send({ category_id: category._id });

    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.data.category_id._id).toBe(category._id);

    const removeRes = await request(app)
      .put(`/api/todos/${todoId}`)
      .set(auth(token))
      .send({ category_id: null });

    expect(removeRes.statusCode).toBe(200);
    expect(removeRes.body.data.category_id).toBeNull();
  });

  it("should filter todos by category", async () => {
    await request(app).post("/api/todos").set(auth(token)).send({ title: "Todo kerja", category_id: category._id });
    await request(app).post("/api/todos").set(auth(token)).send({ title: "Todo lain" });

    const res = await request(app).get(`/api/todos?category=${category._id}`).set(auth(token));

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].title).toBe("Todo kerja");
  });
});
