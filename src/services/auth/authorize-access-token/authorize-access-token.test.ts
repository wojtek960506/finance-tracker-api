import jwt from "jsonwebtoken";
import { authorizeAccessToken } from "./authorize-access-token";
import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import {
  UnauthorizedInvalidTokenError,
  UnauthorizedMissingTokenError,
} from "@utils/errors";


const TEST_ACCESS_SECRET = "unit-test-access-secret";
const originalAccessSecret = process.env.JWT_ACCESS_SECRET;

describe("authorizeAccessToken", () => {
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

  it("throws missing token error when authorization header is not present", async () => {
    const preHandler = authorizeAccessToken();
    const req = { headers: {} } as any;

    await expect(preHandler(req, {} as any)).rejects.toBeInstanceOf(
      UnauthorizedMissingTokenError,
    );
  });

  it("throws missing token error when authorization header is not Bearer", async () => {
    const preHandler = authorizeAccessToken();
    const req = { headers: { authorization: "Basic 123" } } as any;

    await expect(preHandler(req, {} as any)).rejects.toBeInstanceOf(
      UnauthorizedMissingTokenError,
    );
  });

  it("throws invalid token error when jwt verification fails", async () => {
    process.env.JWT_ACCESS_SECRET = TEST_ACCESS_SECRET;
    vi.spyOn(jwt, "verify").mockImplementation(() => {
      throw new Error("jwt verification failed");
    });

    const preHandler = authorizeAccessToken();
    const req = { headers: { authorization: "Bearer invalid-token" } } as any;

    await expect(preHandler(req, {} as any)).rejects.toBeInstanceOf(
      UnauthorizedInvalidTokenError,
    );
    expect(jwt.verify).toHaveBeenCalledOnce();
    expect(jwt.verify).toHaveBeenCalledWith("invalid-token", TEST_ACCESS_SECRET);
  });

  it("assigns userId to request when token is valid", async () => {
    process.env.JWT_ACCESS_SECRET = TEST_ACCESS_SECRET;
    vi.spyOn(jwt, "verify").mockReturnValue({ userId: "user-123" } as any);

    const preHandler = authorizeAccessToken();
    const req = { headers: { authorization: "Bearer valid-token" } } as any;

    await expect(preHandler(req, {} as any)).resolves.toBeUndefined();
    expect(jwt.verify).toHaveBeenCalledOnce();
    expect(jwt.verify).toHaveBeenCalledWith("valid-token", TEST_ACCESS_SECRET);
    expect(req.userId).toBe("user-123");
  });
});
