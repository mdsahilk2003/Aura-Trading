import mongoose from "mongoose";
import { env } from "./env";

export async function connectDatabase(uri = env.MONGODB_URI): Promise<typeof mongoose> {
  if (mongoose.connection.readyState >= 1) {
    return mongoose;
  }
  mongoose.set("strictQuery", true);

  const targetUri =
    uri ||
    "mongodb+srv://sahilvvit_db_user:LfMhDxRHUNkMHxLZ@cluster0.p8ovrze.mongodb.net/aura_trading?retryWrites=true&w=majority";

  try {
    await mongoose.connect(targetUri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 15000,
    });
  } catch (err) {
    if (!process.env.VERCEL && process.env.NODE_ENV === "development") {
      console.log("Local MongoDB not reachable. Bootstrapping dev MongoMemoryServer...");
      const { MongoMemoryServer } = await import("mongodb-memory-server");
      const mongo = await MongoMemoryServer.create();
      await mongoose.connect(mongo.getUri());
    } else {
      console.error("Failed to connect to MongoDB Atlas:", err);
      throw err;
    }
  }
  return mongoose;
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
