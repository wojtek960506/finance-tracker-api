import * as config from "@/config";
import type { JwtPayload } from "jsonwebtoken";
import { ENV_TEST_VALUES } from "@/test-utils/env-consts";
import { afterEach, describe, expect, it, vi } from "vitest";


vi.mock("@/config", () => ({ getEnv: () => ({ ...ENV_TEST_VALUES }) }));

async function loadAuthTokens() {
  vi.resetModules();
  return import("./auth-tokens");
}

describe("auth-tokens", () => {
  const envConfigSpy = vi.spyOn(config, "getEnv");

  afterEach(() => { vi.clearAllMocks() });

  it("creates access token that can be verified", async () => {    
    const { createAccessToken, verifyAccessToken } = await loadAuthTokens();
    const payload = { userId: "user-123", role: "user" };

    const token = createAccessToken(payload);
    expect(envConfigSpy).toHaveBeenCalledOnce();
    
    const verified = verifyAccessToken(token) as JwtPayload;
    expect(envConfigSpy).toHaveBeenCalledTimes(2);
    
    expect(typeof token).toBe("string");
    expect(verified.userId).toBe(payload.userId);
    expect(verified.role).toBe(payload.role);
    expect(verified.exp).toBeGreaterThan(verified.iat!);
  });

  it("throws when access token is invalid", async () => {
    const { verifyAccessToken } = await loadAuthTokens();
    expect(() => verifyAccessToken("invalid-token")).toThrow();
    expect(envConfigSpy).toHaveBeenCalledOnce();
  });

  it("creates refresh token and matching token hash", async () => {
    const { createRefreshToken, getTokenHash } = await loadAuthTokens();

    const { token, tokenHash } = createRefreshToken();

    expect(token).toMatch(/^[a-f0-9]{128}$/);
    expect(tokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(tokenHash).toBe(getTokenHash(token));
  });

  it("returns deterministic sha256 hash for a token", async () => {
    const { getTokenHash } = await loadAuthTokens();

    expect(getTokenHash("abc")).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
  });
});
