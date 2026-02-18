import * as config from "@/config";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getRefreshCookieOptions } from "./refresh-cookie-options";
import { ENV_TEST_VALUES, JWT_REFRESH_EXPIRES_DAYS_TEST } from "@/test-utils/env-consts";


vi.mock("@/config", () => ({ getEnv: vi.fn() }));

describe("getRefreshCookieOptions", () => {
  const envConfigSpy = vi.spyOn(config, "getEnv");

  afterEach(() => { vi.clearAllMocks() });

  it("should return correct options for production environment", () => {
    envConfigSpy.mockReturnValue({ ...ENV_TEST_VALUES, nodeEnv: "production" } as any);

    const options = getRefreshCookieOptions();

    expect(envConfigSpy).toHaveBeenCalledOnce();
    expect(options).toEqual({
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 60 * 60 * 24 * JWT_REFRESH_EXPIRES_DAYS_TEST,
      path: "/",
    });
  });

  it("should return correct options for non-production environment", () => {
    envConfigSpy.mockReturnValue({ ...ENV_TEST_VALUES } as any);

    const options = getRefreshCookieOptions();

    expect(envConfigSpy).toHaveBeenCalledOnce();
    expect(options).toEqual({
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * JWT_REFRESH_EXPIRES_DAYS_TEST,
      path: "/",
    });
  });
});
