const request = require("supertest");
const app = require("../../src/app");

async function registerAndLogin(email = "budi@example.com", extra = {}) {
  await request(app)
    .post("/api/auth/register")
    .send({ name: "Budi", email, password: "rahasia1234567", ...extra });

  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({ email, password: "rahasia1234567" });

  return loginRes.body.data.token;
}

module.exports = { registerAndLogin };
