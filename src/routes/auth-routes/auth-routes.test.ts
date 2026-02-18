import Fastify from "fastify";
import cookie from "@fastify/cookie";
import * as serviceA from "@services/auth";
import * as serviceU from "@services/users";
import { authRoutes } from "./auth-routes";
import { ENV_TEST_VALUES } from "@/test-utils/env-consts";
import { USER_ID_STR } from "@/test-utils/factories/general";
import { registerErrorHandler } from "@plugins/errorHandler";
import { afterEach, describe, expect, it, vi } from "vitest";


const MOCKED_RESULT = { result: "result" };
const LOGIN_DTO = { email: "john@example.com", password: "secret-password" };
const mockPreHandler = vi.fn(async (req, _res) => {
  (req as any).userId = USER_ID_STR;
});

vi.mock("@/config", () => ({ getEnv: () => ({ ...ENV_TEST_VALUES }) }));

vi.mock("@services/auth", () => ({
  login: vi.fn(),
  refresh: vi.fn(),
  logout: vi.fn(),
  authorizeAccessToken: vi.fn(() => mockPreHandler),
}));

const getSetCookieHeaders = (setCookieHeader: string | string[] | undefined) => {
  if (!setCookieHeader) return [];
  return Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
};

describe("auth routes", async () => {
  const app = Fastify();
  await app.register(cookie);
  app.register(authRoutes);
  await registerErrorHandler(app);

  afterEach(() => { vi.clearAllMocks() });

  it("should login user and set refresh cookie - 'POST /login'", async () => {
    vi.spyOn(serviceA, "login").mockResolvedValue({
      accessToken: "access-token",
      refreshToken: "refresh-token",
    });

    const response = await app.inject({ method: "POST", url: "/login", body: LOGIN_DTO });
    const setCookie = getSetCookieHeaders(response.headers["set-cookie"]);

    expect(serviceA.login).toHaveBeenCalledOnce();
    expect(serviceA.login).toHaveBeenCalledWith(LOGIN_DTO);
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ accessToken: "access-token" });
    expect(setCookie.some(header => header.includes("refreshToken=refresh-token"))).toBe(true);
    expect(setCookie.some(header => header.includes("HttpOnly"))).toBe(true);
    expect(setCookie.some(header => header.includes("Secure"))).toBe(false);
    expect(setCookie.some(header => header.includes("SameSite=Lax"))).toBe(true);
  });

  it("should refresh access token and rotate refresh cookie - 'GET /refresh'", async () => {
    vi.spyOn(serviceA, "refresh").mockResolvedValue({
      accessToken: "new-access-token",
      refreshToken: "new-refresh-token",
    });

    const response = await app.inject({
      method: "GET",
      url: "/refresh",
      headers: { cookie: "refreshToken=old-refresh-token" },
    });
    const setCookie = getSetCookieHeaders(response.headers["set-cookie"]);

    expect(serviceA.refresh).toHaveBeenCalledOnce();
    expect(serviceA.refresh).toHaveBeenCalledWith("old-refresh-token");
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ accessToken: "new-access-token" });
    expect(setCookie.some(header => header.includes("refreshToken=new-refresh-token"))).toBe(true);
  });

  it("should logout user and clear refresh cookie - 'POST /logout'", async () => {
    vi.spyOn(serviceA, "logout").mockResolvedValue(undefined as any);

    const response = await app.inject({
      method: "POST",
      url: "/logout",
      headers: { authorization: "Bearer access-token" },
    });
    const setCookie = getSetCookieHeaders(response.headers["set-cookie"]);

    expect(serviceA.logout).toHaveBeenCalledOnce();
    expect(serviceA.logout).toHaveBeenCalledWith("Bearer access-token");
    expect(response.statusCode).toBe(204);
    expect(setCookie.some(header => header.includes("refreshToken=;"))).toBe(true);
    expect(setCookie.some(header => header.includes("Max-Age=0"))).toBe(true);
  });

  it("should get current user - 'GET /me'", async () => {
    vi.spyOn(serviceU, "getUser").mockResolvedValue(MOCKED_RESULT as any);

    const response = await app.inject({ method: "GET", url: "/me" });

    expect(mockPreHandler).toHaveBeenCalledOnce();
    expect(serviceU.getUser).toHaveBeenCalledOnce();
    expect(serviceU.getUser).toHaveBeenCalledWith(USER_ID_STR, USER_ID_STR);
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(MOCKED_RESULT);
  });
});
