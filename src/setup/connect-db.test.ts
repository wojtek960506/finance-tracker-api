import mongoose from "mongoose";
import { connectDB } from "./connect-db";
import { afterEach, describe, expect, it, vi } from "vitest";


describe("connectDB", () => {
  const originalMongoUri = process.env.MONGO_URI;
  const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  const processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);

  afterEach(() => {
    vi.clearAllMocks();
    if (originalMongoUri === undefined) {
      delete process.env.MONGO_URI;
    } else {
      process.env.MONGO_URI = originalMongoUri;
    }
  });

  it("throws when MONGO_URI is not set", async () => {
    delete process.env.MONGO_URI;
    vi.spyOn(mongoose, "connect");

    await expect(connectDB()).rejects.toThrow("MONGO_URI not set in .env");

    expect(mongoose.connect).not.toHaveBeenCalled();
  });

  it("connects to mongo and logs success", async () => {
    process.env.MONGO_URI = "mongodb://localhost:27017/finance-tracker-test";
    vi.spyOn(mongoose, "connect").mockResolvedValue(mongoose as any);

    await connectDB();

    expect(mongoose.connect).toHaveBeenCalledOnce();
    expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGO_URI);
    expect(consoleLogSpy).toHaveBeenCalledWith("MongoDB connected");
    expect(processExitSpy).not.toHaveBeenCalled();
  });

  it("logs error and exits process when mongo connection fails", async () => {
    process.env.MONGO_URI = "mongodb://localhost:27017/finance-tracker-test";
    const error = new Error("db down");
    vi.spyOn(mongoose, "connect").mockRejectedValue(error);

    await connectDB();

    expect(consoleLogSpy).toHaveBeenCalledWith("MongoDB connection failed:", error);
    expect(processExitSpy).toHaveBeenCalledOnce();
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });
});
