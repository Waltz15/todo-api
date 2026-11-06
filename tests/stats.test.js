const request = require("supertest");
const app = require("../src/app");

describe("Stats Endpoint (API Key)", () => {
  it("should reject request without API key", async () => {
    const res = await request(app).get("/api/stats/summary");

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/api key is missing/i);
  });

  it("should reject request with invalid API key", async () => {
    const res = await request(app)
      .get("/api/stats/summary")
      .set("x-api-key", "kunci-ngasal");

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/invalid api key/i);
  });

  it("should return summary with valid API key", async () => {
    const res = await request(app)
      .get("/api/stats/summary")
      .set("x-api-key", process.env.EXTERNAL_API_KEY);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty("totalTodos");
    expect(res.body.data).toHaveProperty("completedTodos");
    expect(res.body.data).toHaveProperty("pendingTodos");
  });
});