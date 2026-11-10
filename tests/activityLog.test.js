const request = require("supertest");
const app = require("../src/app");
const { registerAndLogin } = require("./helpers/auth");

const auth = (token) => ({ Authorization: `Bearer ${token}` });

describe("Activity Log Endpoint", () => {
  it("should require authentication", async () => {
    const res = await request(app).get("/api/activity-logs");
    expect(res.statusCode).toBe(401);
  });

  it("should record and return the user's own todo activities", async () => {
    const token = await registerAndLogin();

    const createRes = await request(app).post("/api/todos").set(auth(token)).send({ title: "Todo dicatat" });
    const todoId = createRes.body.data._id;
    await request(app).put(`/api/todos/${todoId}`).set(auth(token)).send({ completed: true });
    await request(app).delete(`/api/todos/${todoId}`).set(auth(token));

    const res = await request(app).get("/api/activity-logs?resource=Todo").set(auth(token));

    expect(res.statusCode).toBe(200);
    const actions = res.body.data.map((log) => log.action);
    expect(actions).toEqual(expect.arrayContaining(["CREATE", "UPDATE", "ARCHIVE"]));
    expect(res.body.data[0].resource_id).toBe(todoId);
    expect(res.body.pagination.totalItems).toBe(3);
  });

  it("should record REGISTER and LOGIN activities", async () => {
    const token = await registerAndLogin();

    const res = await request(app).get("/api/activity-logs?resource=Auth").set(auth(token));

    expect(res.statusCode).toBe(200);
    const actions = res.body.data.map((log) => log.action);
    expect(actions).toEqual(expect.arrayContaining(["REGISTER", "LOGIN"]));
  });

  it("should only show a user's own logs", async () => {
    const budiToken = await registerAndLogin();
    await request(app).post("/api/todos").set(auth(budiToken)).send({ title: "Todo milik Budi" });

    const sitiToken = await registerAndLogin("siti@example.com");
    const res = await request(app).get("/api/activity-logs?resource=Todo").set(auth(sitiToken));

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(0);
  });

  it("should let admin see all users' logs", async () => {
    const budiToken = await registerAndLogin();
    await request(app).post("/api/todos").set(auth(budiToken)).send({ title: "Todo milik Budi" });

    const adminToken = await registerAndLogin("admin@example.com", {
      secret_key: process.env.ADMIN_SECRET_KEY,
    });
    const res = await request(app).get("/api/activity-logs?resource=Todo").set(auth(adminToken));

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].user_id.email).toBe("budi@example.com");
  });

  it("should reject invalid filters", async () => {
    const token = await registerAndLogin();
    const res = await request(app).get("/api/activity-logs?action=NGAWUR").set(auth(token));
    expect(res.statusCode).toBe(400);
  });
});
