import mongoose from "mongoose";
import { env } from "./env";

export async function connectDatabase(uri = env.MONGODB_URI): Promise<typeof mongoose> {
  if (mongoose.connection.readyState >= 1) {
    return mongoose;
  }
  mongoose.set("strictQuery", true);
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000, connectTimeoutMS: 10000 });
  } catch (err) {
    if (env.NODE_ENV !== "production") {
      console.log("Local MongoDB not reachable. Bootstrapping dev MongoMemoryServer...");
      const { MongoMemoryServer } = await import("mongodb-memory-server");
      const mongo = await MongoMemoryServer.create();
      await mongoose.connect(mongo.getUri());
    } else {
      throw err;
    }
  }
  return mongoose;
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
