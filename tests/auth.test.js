const request = require("supertest");
const app = require("../src/app");

describe("Auth Endpoints", () => {
  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Budi",
        email: "budi@example.com",
        password: "rahasia1234567",
      });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe("budi@example.com");
      expect(res.body.data.token).toBeDefined();
    });

    it("should reject registration with missing fields", async () => {
      const res = await request(app).post("/api/auth/register").send({
        email: "budi@example.com",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should reject duplicate email", async () => {
      await request(app).post("/api/auth/register").send({
        name: "Budi",
        email: "budi@example.com",
        password: "rahasia1234567",
      });

      const res = await request(app).post("/api/auth/register").send({
        name: "Budi Kedua",
        email: "budi@example.com",
        password: "rahasia4567890",
      });

      expect(res.statusCode).toBe(409);
      expect(res.body.message).toMatch(/already registered/i);
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await request(app).post("/api/auth/register").send({
        name: "Budi",
        email: "budi@example.com",
        password: "rahasia1234567",
      });
    });

    it("should login successfully with correct credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "budi@example.com",
        password: "rahasia1234567",
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.token).toBeDefined();
    });

    it("should reject login with wrong password", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "budi@example.com",
        password: "password-salah-banget",
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toMatch(/invalid email or password/i);
    });
  });
});