import mongoose from "mongoose";
import { env } from "./env";

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  if (!env.MONGO_URI) {
    console.warn("MongoDB URI not set. Skipping DB connection.");
    return;
  }
  await mongoose.connect(env.MONGO_URI);
  console.log("✅ Connected to MongoDB");
}
