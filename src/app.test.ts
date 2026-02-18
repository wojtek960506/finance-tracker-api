import * as config from "@/config";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  PORT_TEST,
  ENV_TEST_VALUES,
  COOKIE_SECRET_TEST,
  JWT_ACCESS_SECRET_TEST,
} from "@/test-utils/env-consts";


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


vi.mock("@/config", () => ({ getEnv: () => ({ ...ENV_TEST_VALUES }) }));

describe("app bootstrap", () => {
  const envConfigSpy = vi.spyOn(config, "getEnv");
  const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    appMock.withTypeProvider.mockReturnValue(appMock);
    appMock.register.mockResolvedValue(undefined);
    appMock.listen.mockResolvedValue(undefined);
  });
  
  it("builds app and registers plugins/routes", async () => {
    const { buildApp } = await import("./app");

    const result = await buildApp();

    expect(envConfigSpy).toHaveBeenCalledOnce();
    expect(fastifyMock).toHaveBeenCalledOnce();
    expect(fastifyMock).toHaveBeenCalledWith({ logger: true });
    expect(appMock.withTypeProvider).toHaveBeenCalledOnce();
    expect(upsertSystemCategoriesMock).toHaveBeenCalledOnce();
    expect(appMock.register).toHaveBeenCalledWith(cookiePluginMock, {
      secret: COOKIE_SECRET_TEST,
      parseOptions: {},
    });
    expect(appMock.register).toHaveBeenCalledWith(jwtPluginMock, {
      secret: JWT_ACCESS_SECRET_TEST,
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
    const { start } = await import("./app");

    await start();

    expect(envConfigSpy).toHaveBeenCalledOnce();
    expect(connectDBMock).toHaveBeenCalledOnce();
    expect(appMock.listen).toHaveBeenCalledOnce();
    expect(appMock.listen).toHaveBeenCalledWith({ port: PORT_TEST, host: "0.0.0.0" });
    expect(consoleLogSpy).toHaveBeenCalledWith(`Server running on port ${PORT_TEST}`);
  });

  it("logs and exits when listen fails", async () => {
    const error = new Error("listen failed");
    appMock.listen.mockRejectedValue(error);
    const processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    const { start } = await import("./app");

    await start();

    expect(envConfigSpy).toHaveBeenCalledOnce();
    expect(appMock.log.error).toHaveBeenCalledOnce();
    expect(appMock.log.error).toHaveBeenCalledWith(error);
    expect(processExitSpy).toHaveBeenCalledOnce();
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });
});
