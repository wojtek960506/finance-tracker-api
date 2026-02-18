import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";


const {
  appMock,
  fastifyMock,
  connectDBMock,
  jwtPluginMock,
  mainRoutesMock,
  authRoutesMock,
  userRoutesMock,
  corsPluginMock,
  cookiePluginMock,
  categoryRoutesMock,
  transactionRoutesMock,
  registerErrorHandlerMock,
  upsertSystemCategoriesMock,
} = vi.hoisted(() => {
  const app = {
    register: vi.fn().mockResolvedValue(undefined),
    withTypeProvider: vi.fn(),
    listen: vi.fn().mockResolvedValue(undefined),
    log: { error: vi.fn() },
  } as any;
  app.withTypeProvider.mockReturnValue(app);

  return {
    appMock: app,
    fastifyMock: vi.fn(() => app),
    upsertSystemCategoriesMock: vi.fn(),
    connectDBMock: vi.fn(),
    registerErrorHandlerMock: vi.fn(),
    mainRoutesMock: vi.fn(),
    authRoutesMock: vi.fn(),
    userRoutesMock: vi.fn(),
    categoryRoutesMock: vi.fn(),
    transactionRoutesMock: vi.fn(),
    cookiePluginMock: vi.fn(),
    jwtPluginMock: vi.fn(),
    corsPluginMock: vi.fn(),
  };
});

vi.mock("fastify", () => ({ default: fastifyMock }));
vi.mock("@fastify/cookie", () => ({ default: cookiePluginMock }));
vi.mock("@fastify/jwt", () => ({ default: jwtPluginMock }));
vi.mock("@fastify/cors", () => ({ default: corsPluginMock }));
vi.mock("@/setup", () => ({
  upsertSystemCategories: upsertSystemCategoriesMock,
  connectDB: connectDBMock,
}));
vi.mock("./plugins/errorHandler", () => ({
  registerErrorHandler: registerErrorHandlerMock,
}));
vi.mock("@/routes", () => ({
  mainRoutes: mainRoutesMock,
  authRoutes: authRoutesMock,
  userRoutes: userRoutesMock,
  categoryRoutes: categoryRoutesMock,
  transactionRoutes: transactionRoutesMock,
}));

describe("app bootstrap", () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalPort = process.env.PORT;
  const originalCookieSecret = process.env.COOKIE_SECRET;
  const originalJwtSecret = process.env.JWT_ACCESS_SECRET;
  const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.NODE_ENV = "test";
    process.env.JWT_ACCESS_SECRET = "jwt-secret";
    delete process.env.PORT;
    delete process.env.COOKIE_SECRET;
    appMock.withTypeProvider.mockReturnValue(appMock);
    appMock.register.mockResolvedValue(undefined);
    appMock.listen.mockResolvedValue(undefined);
  });

  afterEach(() => {
    if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalNodeEnv;

    if (originalPort === undefined) delete process.env.PORT;
    else process.env.PORT = originalPort;

    if (originalCookieSecret === undefined) delete process.env.COOKIE_SECRET;
    else process.env.COOKIE_SECRET = originalCookieSecret;

    if (originalJwtSecret === undefined) delete process.env.JWT_ACCESS_SECRET;
    else process.env.JWT_ACCESS_SECRET = originalJwtSecret;
  });

  it("builds app and registers plugins/routes", async () => {
    process.env.COOKIE_SECRET = "cookie-secret";
    const { buildApp } = await import("./app");

    const result = await buildApp();

    expect(fastifyMock).toHaveBeenCalledOnce();
    expect(fastifyMock).toHaveBeenCalledWith({ logger: true });
    expect(appMock.withTypeProvider).toHaveBeenCalledOnce();
    expect(upsertSystemCategoriesMock).toHaveBeenCalledOnce();
    expect(appMock.register).toHaveBeenCalledWith(cookiePluginMock, {
      secret: "cookie-secret",
      parseOptions: {},
    });
    expect(appMock.register).toHaveBeenCalledWith(jwtPluginMock, {
      secret: "jwt-secret",
    });
    expect(appMock.register).toHaveBeenCalledWith(mainRoutesMock, { prefix: "" });
    expect(appMock.register).toHaveBeenCalledWith(authRoutesMock, { prefix: "/api/auth" });
    expect(appMock.register).toHaveBeenCalledWith(userRoutesMock, { prefix: "/api/users" });
    expect(appMock.register).toHaveBeenCalledWith(
      categoryRoutesMock, { prefix: "/api/categories" }
    );
    expect(appMock.register).toHaveBeenCalledWith(
      transactionRoutesMock, { prefix: "/api/transactions" }
    );
    expect(registerErrorHandlerMock).toHaveBeenCalledOnce();
    expect(registerErrorHandlerMock).toHaveBeenCalledWith(appMock);
    expect(appMock.register).toHaveBeenCalledWith(
      corsPluginMock,
      expect.objectContaining({
        credentials: true,
      }),
    );
    expect(result).toBe(appMock);
  });

  it("does not auto-start on app module import", async () => {
    await import("./app");

    expect(connectDBMock).not.toHaveBeenCalled();
  });

  it("starts server", async () => {
    process.env.PORT = "7777";
    const { start } = await import("./app");

    await start();

    expect(connectDBMock).toHaveBeenCalledOnce();
    expect(appMock.listen).toHaveBeenCalledOnce();
    expect(appMock.listen).toHaveBeenCalledWith({ port: 7777, host: "0.0.0.0" });
    expect(consoleLogSpy).toHaveBeenCalledWith("Server running on port 7777");
  });

  it("logs and exits when listen fails", async () => {
    const error = new Error("listen failed");
    appMock.listen.mockRejectedValue(error);
    const processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    const { start } = await import("./app");

    await start();

    expect(appMock.log.error).toHaveBeenCalledOnce();
    expect(appMock.log.error).toHaveBeenCalledWith(error);
    expect(processExitSpy).toHaveBeenCalledOnce();
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });
});
