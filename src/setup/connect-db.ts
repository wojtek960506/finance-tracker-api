import mongoose from "mongoose";


export async function connectDB() {
  const uri = process.env.MONGO_URI!;
  if (!uri) throw new Error("MONGO_URI not set in .env");

  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (err) {
    console.log("MongoDB connection failed:", err);
    process.exit(1);
  }
}
