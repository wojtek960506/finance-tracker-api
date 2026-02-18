import { afterAll, describe, expect, it } from "vitest";
import { getRefreshCookieOptions } from "./refresh-cookie-options";


const originalNodeEnv = process.env.NODE_ENV;
const originalRefreshExpiresDays = process.env.JWT_REFRESH_EXPIRES_DAYS;

afterAll(() => {
  if (originalNodeEnv === undefined) {
    delete process.env.NODE_ENV;
    return;
  }
  process.env.NODE_ENV = originalNodeEnv;

  if (originalRefreshExpiresDays === undefined) {
    delete process.env.JWT_REFRESH_EXPIRES_DAYS;
    return;
  }
  process.env.JWT_REFRESH_EXPIRES_DAYS = originalRefreshExpiresDays;
});

describe("getRefreshCookieOptions", () => {

  it("should return correct options for production environment", () => {
    process.env.NODE_ENV = "production";
    process.env.JWT_REFRESH_EXPIRES_DAYS = "15";

    const options = getRefreshCookieOptions();

    expect(options).toEqual({
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 60 * 60 * 24 * 15,
      path: "/",
    });
  });

  it("should return correct options for non-production environment", () => {
    process.env.NODE_ENV = "development";
    delete process.env.JWT_REFRESH_EXPIRES_DAYS;

    const options = getRefreshCookieOptions();

    expect(options).toEqual({
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

  });
});
