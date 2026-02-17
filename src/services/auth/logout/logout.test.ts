import jwt from "jsonwebtoken";
import { logout } from "./logout";
import { UserModel } from "@models/user-model";
import { afterAll, afterEach, describe, expect, it, vi } from "vitest";


const TEST_ACCESS_SECRET = "unit-test-access-secret";
const originalAccessSecret = process.env.JWT_ACCESS_SECRET;

describe("logout", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  afterAll(() => {
    if (originalAccessSecret === undefined) {
      delete process.env.JWT_ACCESS_SECRET;
      return;
    }
    process.env.JWT_ACCESS_SECRET = originalAccessSecret;
  });

  it("returns when authorization header is missing", async () => {
    const verifySpy = vi.spyOn(jwt, "verify");
    await expect(logout(undefined)).resolves.toBeUndefined();
    expect(verifySpy).not.toHaveBeenCalled();
  });

  it("returns when authorization header is not Bearer", async () => {
    const verifySpy = vi.spyOn(jwt, "verify");
    await expect(logout("Basic token")).resolves.toBeUndefined();
    expect(verifySpy).not.toHaveBeenCalled();
  });

  it("returns when access token is invalid", async () => {
    process.env.JWT_ACCESS_SECRET = TEST_ACCESS_SECRET;
    vi.spyOn(jwt, "verify").mockImplementation(() => {
      throw new Error("invalid token");
    });
    const findOneSpy = vi.spyOn(UserModel, "findOne");

    await expect(logout("Bearer invalid-token")).resolves.toBeUndefined();
    expect(jwt.verify).toHaveBeenCalledOnce();
    expect(jwt.verify).toHaveBeenCalledWith("invalid-token", TEST_ACCESS_SECRET);
    expect(findOneSpy).not.toHaveBeenCalled();
  });

  it("returns when user from token payload is not found", async () => {
    process.env.JWT_ACCESS_SECRET = TEST_ACCESS_SECRET;
    vi.spyOn(jwt, "verify").mockReturnValue({ userId: "user-123" } as any);
    const findOneSpy = vi.spyOn(UserModel, "findOne").mockResolvedValue(null as any);

    await expect(logout("Bearer valid-token")).resolves.toBeUndefined();
    expect(findOneSpy).toHaveBeenCalledOnce();
    expect(findOneSpy).toHaveBeenCalledWith({ _id: "user-123" });
  });

  it("clears refresh token hash and saves user", async () => {
    process.env.JWT_ACCESS_SECRET = TEST_ACCESS_SECRET;
    vi.spyOn(jwt, "verify").mockReturnValue({ userId: "user-123" } as any);
    const userSaveMock = vi.fn().mockResolvedValue(undefined);
    const user = {
      refreshTokenHash: { tokenHash: "token-hash", createdAt: new Date() },
      save: userSaveMock,
    } as any;
    vi.spyOn(UserModel, "findOne").mockResolvedValue(user);

    await expect(logout("Bearer valid-token")).resolves.toBeUndefined();
    expect(user.refreshTokenHash).toBeUndefined();
    expect(userSaveMock).toHaveBeenCalledOnce();
  });
});
