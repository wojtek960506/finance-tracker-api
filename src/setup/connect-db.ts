import mongoose from "mongoose";
import { getEnv } from "@/config";


export async function connectDB() {
  const { mongoUri } = getEnv();

  try {
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected");
  } catch (err) {
    console.log("MongoDB connection failed:", err);
    process.exit(1);
  }
}
