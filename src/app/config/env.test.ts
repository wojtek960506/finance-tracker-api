import { getEnv } from "./env";
import { afterEach, describe, expect, it } from "vitest";


describe("getEnv", () => {
  const originalEnv = { ...process.env };

  const setRequiredEnv = () => {
    process.env.MONGO_URI = "mongodb://localhost:27017/finance-tracker-test";
    process.env.DATABASE_USER = "db-user";
    process.env.DATABASE_PASSWORD = "db-password";
    process.env.JWT_ACCESS_SECRET = "jwt-secret";
    process.env.COOKIE_SECRET = "cookie-secret";
  };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("returns parsed env values", () => {
    setRequiredEnv();
    process.env.NODE_ENV = "production";
    process.env.PORT = "8080";
    process.env.JWT_ACCESS_EXPIRES_IN = "30m";
    process.env.JWT_REFRESH_EXPIRES_DAYS = "14";

    const env = getEnv();

    expect(env).toEqual({
      nodeEnv: "production",
      port: 8080,
      mongoUri: "mongodb://localhost:27017/finance-tracker-test",
      databaseUser: "db-user",
      databasePassword: "db-password",
      jwtAccessSecret: "jwt-secret",
      cookieSecret: "cookie-secret",
      jwtAccessExpiresIn: "30m",
      jwtRefreshExpiresDays: 14,
    });
  });

  it("uses defaults for optional env values", () => {
    setRequiredEnv();
    delete process.env.NODE_ENV;
    delete process.env.PORT;
    delete process.env.JWT_ACCESS_EXPIRES_IN;
    delete process.env.JWT_REFRESH_EXPIRES_DAYS;

    const env = getEnv();

    expect(env.nodeEnv).toBe("development");
    expect(env.port).toBe(5000);
    expect(env.jwtAccessExpiresIn).toBe("15m");
    expect(env.jwtRefreshExpiresDays).toBe(30);
  });

  it.each([
    ["MONGO_URI", "MONGO_URI is not defined in environment variables"],
    ["DATABASE_USER", "DATABASE_USER is not defined in environment variables"],
    ["DATABASE_PASSWORD", "DATABASE_PASSWORD is not defined in environment variables"],
    ["JWT_ACCESS_SECRET", "JWT_ACCESS_SECRET is not defined in environment variables"],
    ["COOKIE_SECRET", "COOKIE_SECRET is not defined in environment variables"],
  ])("throws when %s is missing", (key, message) => {
    setRequiredEnv();
    delete process.env[key as keyof NodeJS.ProcessEnv];

    expect(() => getEnv()).toThrow(message);
  });
});
