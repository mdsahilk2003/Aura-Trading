import { beforeAll, afterAll } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret-key-32chars!!";
process.env.ENABLE_TEST_AUTH = "true";
process.env.TEST_AUTH_SECRET = "dev-test-auth-secret";
process.env.MARKET_DATA_PROVIDER = "development";
process.env.BROKER_PROVIDER = "paper";
process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/aura_test";

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongo.getUri();
  await mongoose.connect(process.env.MONGODB_URI);
  const { seedInstruments } = await import("../src/utils/seed");
  await seedInstruments();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});
