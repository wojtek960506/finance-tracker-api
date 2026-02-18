import type { JwtPayload } from "jsonwebtoken";
import { afterAll, describe, expect, it, vi } from "vitest";


const TEST_ACCESS_SECRET = "unit-test-access-secret";
const originalAccessSecret = process.env.JWT_ACCESS_SECRET;

async function loadAuthTokens() {
  vi.resetModules();
  process.env.JWT_ACCESS_SECRET = TEST_ACCESS_SECRET;
  return import("./auth-tokens");
}

afterAll(() => {
  if (originalAccessSecret === undefined) {
    delete process.env.JWT_ACCESS_SECRET;
    return;
  }
  process.env.JWT_ACCESS_SECRET = originalAccessSecret;
});

describe("auth-tokens", () => {
  it("creates access token that can be verified", async () => {
    const { createAccessToken, verifyAccessToken } = await loadAuthTokens();
    const payload = { userId: "user-123", role: "user" };

    const token = createAccessToken(payload);
    const verified = verifyAccessToken(token) as JwtPayload;

    expect(typeof token).toBe("string");
    expect(verified.userId).toBe(payload.userId);
    expect(verified.role).toBe(payload.role);
    expect(verified.exp).toBeGreaterThan(verified.iat!);
  });

  it("throws when access token is invalid", async () => {
    const { verifyAccessToken } = await loadAuthTokens();
    expect(() => verifyAccessToken("invalid-token")).toThrow();
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
