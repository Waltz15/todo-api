// .env.test bersifat opsional dan tidak di-commit (lihat .env.test.example).
require("dotenv").config({ path: ".env.test" });

// Nilai default khusus test, dipakai jika .env.test tidak ada.
// Ini BUKAN kredensial asli dan hanya berlaku di database in-memory saat test.
const testDefaults = {
  NODE_ENV: "test",
  JWT_SECRET: "test-only-jwt-secret",
  JWT_EXPIRES_IN: "1d",
  EXTERNAL_API_KEY: "test-only-api-key",
  ADMIN_SECRET_KEY: "test-only-admin-key",
};
for (const [key, value] of Object.entries(testDefaults)) {
  if (!process.env[key]) process.env[key] = value;
}
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
}, 60000);

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});