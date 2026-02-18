import jwt from "jsonwebtoken";
import { logout } from "./logout";
import * as config from "@/config";
import { UserModel } from "@models/user-model";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ENV_TEST_VALUES, JWT_ACCESS_SECRET_TEST } from "@/test-utils/env-consts";


vi.mock("@/config", () => ({ getEnv: () => ({ ...ENV_TEST_VALUES }) }));

describe("logout", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const verifySpy = vi.spyOn(jwt, "verify");
  const envConfigSpy = vi.spyOn(config, "getEnv");

  it("returns when authorization header is missing", async () => {

    await expect(logout(undefined)).resolves.toBeUndefined();
    expect(envConfigSpy).not.toHaveBeenCalled();
    expect(verifySpy).not.toHaveBeenCalled();
  });

  it("returns when authorization header is not Bearer", async () => {
    await expect(logout("Basic token")).resolves.toBeUndefined();
    expect(verifySpy).not.toHaveBeenCalled();
  });

  it("returns when access token is invalid", async () => {
    verifySpy.mockImplementation(() => {
      throw new Error("invalid token");
    });
    const findOneSpy = vi.spyOn(UserModel, "findOne");

    await expect(logout("Bearer invalid-token")).resolves.toBeUndefined();
    expect(envConfigSpy).toHaveBeenCalledOnce();
    expect(jwt.verify).toHaveBeenCalledOnce();
    expect(jwt.verify).toHaveBeenCalledWith("invalid-token", JWT_ACCESS_SECRET_TEST);
    expect(findOneSpy).not.toHaveBeenCalled();
  });

  it("returns when user from token payload is not found", async () => {
    verifySpy.mockReturnValue({ userId: "user-123" } as any);
    const findOneSpy = vi.spyOn(UserModel, "findOne").mockResolvedValue(null as any);

    await expect(logout("Bearer valid-token")).resolves.toBeUndefined();
    expect(envConfigSpy).toHaveBeenCalledOnce();
    expect(findOneSpy).toHaveBeenCalledOnce();
    expect(findOneSpy).toHaveBeenCalledWith({ _id: "user-123" });
  });

  it("clears refresh token hash and saves user", async () => {
    verifySpy.mockReturnValue({ userId: "user-123" } as any);
    const userSaveMock = vi.fn().mockResolvedValue(undefined);
    const user = {
      refreshTokenHash: { tokenHash: "token-hash", createdAt: new Date() },
      save: userSaveMock,
    } as any;
    vi.spyOn(UserModel, "findOne").mockResolvedValue(user);

    await expect(logout("Bearer valid-token")).resolves.toBeUndefined();
    expect(envConfigSpy).toHaveBeenCalledOnce();
    expect(user.refreshTokenHash).toBeUndefined();
    expect(userSaveMock).toHaveBeenCalledOnce();
  });
});
