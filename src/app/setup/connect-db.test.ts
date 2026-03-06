import mongoose from "mongoose"
import * as config from "@app/config"
import { connectDB } from "./connect-db"
import { it, vi, expect, describe, afterEach } from "vitest"
import { MONGO_URI_TEST, ENV_TEST_VALUES } from "@/test-utils/env-consts"


vi.mock("@app/config", () => ({ getEnv: () => ({ ...ENV_TEST_VALUES }) }));

describe("connectDB", () => {
  const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  const processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
  const envConfigSpy = vi.spyOn(config, "getEnv");

  afterEach(() => { vi.clearAllMocks() });

  it("connects to mongo and logs success", async () => {
    vi.spyOn(mongoose, "connect").mockResolvedValue(mongoose as any);

    await connectDB();

    expect(envConfigSpy).toHaveBeenCalledOnce();
    expect(mongoose.connect).toHaveBeenCalledOnce();
    expect(mongoose.connect).toHaveBeenCalledWith(MONGO_URI_TEST);
    expect(consoleLogSpy).toHaveBeenCalledWith("MongoDB connected");
    expect(processExitSpy).not.toHaveBeenCalled();
  });

  it("logs error and exits process when mongo connection fails", async () => {
    const error = new Error("db down");
    vi.spyOn(mongoose, "connect").mockRejectedValue(error);

    await connectDB();

    expect(envConfigSpy).toHaveBeenCalledOnce();
    expect(consoleLogSpy).toHaveBeenCalledWith("MongoDB connection failed:", error);
    expect(processExitSpy).toHaveBeenCalledOnce();
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });
});
