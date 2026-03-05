import jwt from "jsonwebtoken";
import * as config from "@/config";
import { afterEach, describe, expect, it, vi } from "vitest";
import { authorizeAccessToken } from "./authorize-access-token";
import { ENV_TEST_VALUES, JWT_ACCESS_SECRET_TEST } from "@/test-utils/env-consts";
import {
  UnauthorizedInvalidTokenError,
  UnauthorizedMissingTokenError,
} from "@utils/errors";


vi.mock("@/config", () => ({ getEnv: () => ({ ...ENV_TEST_VALUES }) }));

describe("authorizeAccessToken", () => {
  afterEach(() => { vi.clearAllMocks() });
  const jwtSpy = vi.spyOn(jwt, "verify")
  const envConfigSpy = vi.spyOn(config, "getEnv");

  it("throws missing token error when authorization header is not present", async () => {
    const preHandler = authorizeAccessToken();
    const req = { headers: {} } as any;

    await expect(preHandler(req, {} as any)).rejects.toBeInstanceOf(
      UnauthorizedMissingTokenError,
    );
    expect(envConfigSpy).not.toHaveBeenCalled();
  });

  it("throws missing token error when authorization header is not Bearer", async () => {
    const preHandler = authorizeAccessToken();
    const req = { headers: { authorization: "Basic 123" } } as any;

    await expect(preHandler(req, {} as any)).rejects.toBeInstanceOf(
      UnauthorizedMissingTokenError,
    );
    expect(envConfigSpy).not.toHaveBeenCalled();
  });

  it("throws invalid token error when jwt verification fails", async () => {
    jwtSpy.mockImplementation(() => {
      throw new Error("jwt verification failed");
    });

    const preHandler = authorizeAccessToken();
    const req = { headers: { authorization: "Bearer invalid-token" } } as any;

    await expect(preHandler(req, {} as any)).rejects.toBeInstanceOf(
      UnauthorizedInvalidTokenError,
    );
    expect(envConfigSpy).toHaveBeenCalledOnce();
    expect(jwt.verify).toHaveBeenCalledOnce();
    expect(jwt.verify).toHaveBeenCalledWith("invalid-token", JWT_ACCESS_SECRET_TEST);
  });

  it("assigns userId to request when token is valid", async () => {
    jwtSpy.mockReturnValue({ userId: "user-123" } as any);

    const preHandler = authorizeAccessToken();
    const req = { headers: { authorization: "Bearer valid-token" } } as any;

    await expect(preHandler(req, {} as any)).resolves.toBeUndefined();
    expect(envConfigSpy).toHaveBeenCalledOnce();
    expect(jwt.verify).toHaveBeenCalledOnce();
    expect(jwt.verify).toHaveBeenCalledWith("valid-token", JWT_ACCESS_SECRET_TEST);
    expect(req.userId).toBe("user-123");
  });
});
