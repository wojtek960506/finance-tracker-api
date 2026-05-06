import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as config from '@app/config';
import {
  COOKIE_SECRET_TEST,
  CORS_ORIGIN_PATTERNS_TEST,
  CORS_ORIGINS_TEST,
  ENV_TEST_VALUES,
  JWT_ACCESS_SECRET_TEST,
  PORT_TEST,
} from '@testing/env-consts';

const {
  appMock,
  fastifyMock,
  connectDBMock,
  jwtPluginMock,
  mainRoutesMock,
  authRoutesMock,
  userRoutesMock,
  accountRoutesMock,
  corsPluginMock,
  cookiePluginMock,
  categoryRoutesMock,
  transactionRoutesMock,
  currencyRoutesMock,
  paymentMethodRoutesMock,
  registerErrorHandlerMock,
  upsertSystemCategoriesMock,
  upsertSystemPaymentMethodsMock,
  upsertSystemAccountsMock,
} = vi.hoisted(() => {
  const app = {
    register: vi.fn().mockResolvedValue(undefined),
    withTypeProvider: vi.fn(),
    setValidatorCompiler: vi.fn(),
    setSerializerCompiler: vi.fn(),
    listen: vi.fn().mockResolvedValue(undefined),
    log: { error: vi.fn() },
  } as any;
  app.withTypeProvider.mockReturnValue(app);

  return {
    appMock: app,
    fastifyMock: vi.fn(() => app),
    upsertSystemCategoriesMock: vi.fn(),
    connectDBMock: vi.fn(),
    upsertSystemPaymentMethodsMock: vi.fn(),
    upsertSystemAccountsMock: vi.fn(),
    registerErrorHandlerMock: vi.fn(),
    mainRoutesMock: vi.fn(),
    authRoutesMock: vi.fn(),
    userRoutesMock: vi.fn(),
    categoryRoutesMock: vi.fn(),
    paymentMethodRoutesMock: vi.fn(),
    accountRoutesMock: vi.fn(),
    currencyRoutesMock: vi.fn(),
    transactionRoutesMock: vi.fn(),
    cookiePluginMock: vi.fn(),
    jwtPluginMock: vi.fn(),
    corsPluginMock: vi.fn(),
  };
});

vi.mock('fastify', () => ({ default: fastifyMock }));
vi.mock('@fastify/cookie', () => ({ default: cookiePluginMock }));
vi.mock('@fastify/jwt', () => ({ default: jwtPluginMock }));
vi.mock('@fastify/cors', () => ({ default: corsPluginMock }));
vi.mock('@app/setup', () => ({
  upsertSystemCategories: upsertSystemCategoriesMock,
  upsertSystemPaymentMethods: upsertSystemPaymentMethodsMock,
  upsertSystemAccounts: upsertSystemAccountsMock,
  connectDB: connectDBMock,
}));
vi.mock('./plugins/errorHandler', () => ({
  registerErrorHandler: registerErrorHandlerMock,
}));
vi.mock('@app/routes', () => ({
  mainRoutes: mainRoutesMock,
}));

vi.mock('@auth/routes', () => ({ authRoutes: authRoutesMock }));
vi.mock('@user/routes', () => ({ userRoutes: userRoutesMock }));
vi.mock('@named-resource/routes', () => ({
  accountRoutes: accountRoutesMock,
  categoryRoutes: categoryRoutesMock,
  paymentMethodRoutes: paymentMethodRoutesMock,
}));
vi.mock('@currency/routes', () => ({ currencyRoutes: currencyRoutesMock }));
vi.mock('@transaction/routes', () => ({ transactionRoutes: transactionRoutesMock }));

vi.mock('@app/config', () => ({ getEnv: () => ({ ...ENV_TEST_VALUES }) }));

describe('app bootstrap', () => {
  const envConfigSpy = vi.spyOn(config, 'getEnv');
  const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    appMock.withTypeProvider.mockReturnValue(appMock);
    appMock.register.mockResolvedValue(undefined);
    appMock.listen.mockResolvedValue(undefined);
  });

  it('builds app and registers plugins/routes', async () => {
    const { buildApp } = await import('./app');

    const result = await buildApp();

    expect(envConfigSpy).toHaveBeenCalledOnce();
    expect(fastifyMock).toHaveBeenCalledOnce();
    expect(fastifyMock).toHaveBeenCalledWith({ logger: true });
    expect(appMock.withTypeProvider).toHaveBeenCalledOnce();
    expect(upsertSystemCategoriesMock).toHaveBeenCalledOnce();
    expect(upsertSystemPaymentMethodsMock).toHaveBeenCalledOnce();
    expect(appMock.register).toHaveBeenCalledWith(cookiePluginMock, {
      secret: COOKIE_SECRET_TEST,
      parseOptions: {},
    });
    expect(appMock.register).toHaveBeenCalledWith(jwtPluginMock, {
      secret: JWT_ACCESS_SECRET_TEST,
    });
    expect(appMock.register).toHaveBeenCalledWith(mainRoutesMock, { prefix: '' });
    expect(appMock.register).toHaveBeenCalledWith(authRoutesMock, {
      prefix: '/api/auth',
    });
    expect(appMock.register).toHaveBeenCalledWith(userRoutesMock, {
      prefix: '/api/users',
    });
    expect(appMock.register).toHaveBeenCalledWith(categoryRoutesMock, {
      prefix: '/api/categories',
    });
    expect(appMock.register).toHaveBeenCalledWith(paymentMethodRoutesMock, {
      prefix: '/api/paymentMethods',
    });
    expect(appMock.register).toHaveBeenCalledWith(transactionRoutesMock, {
      prefix: '/api/transactions',
    });
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

  it('registers CORS before application routes', async () => {
    const { buildApp } = await import('./app');

    await buildApp();

    const registeredPlugins = appMock.register.mock.calls.map(([plugin]: [unknown]) => plugin);
    const corsIndex = registeredPlugins.indexOf(corsPluginMock);
    const firstRouteIndex = registeredPlugins.indexOf(mainRoutesMock);

    expect(corsIndex).toBeGreaterThanOrEqual(0);
    expect(firstRouteIndex).toBeGreaterThanOrEqual(0);
    expect(corsIndex).toBeLessThan(firstRouteIndex);
  });

  it('allows configured static and pattern-based CORS origins', async () => {
    const { buildApp } = await import('./app');

    await buildApp();

    const corsCall = appMock.register.mock.calls.find(
      ([plugin]: [unknown, unknown]) => plugin === corsPluginMock,
    );
    const corsOptions = corsCall?.[1];

    expect(corsOptions).toBeDefined();
    expect(typeof corsOptions.origin).toBe('function');

    const staticOrigin = CORS_ORIGINS_TEST[0];
    const previewOrigin = 'https://example-frontend-l8883h29p-preview.vercel.app';
    const deniedOrigin = 'https://example.com';

    const allowedStatic = await new Promise<boolean>((resolve, reject) => {
      corsOptions.origin(staticOrigin, (error: Error | null, allowed: boolean) => {
        if (error) reject(error);
        else resolve(allowed);
      });
    });

    const allowedPreview = await new Promise<boolean>((resolve, reject) => {
      corsOptions.origin(previewOrigin, (error: Error | null, allowed: boolean) => {
        if (error) reject(error);
        else resolve(allowed);
      });
    });

    const denied = await new Promise<boolean>((resolve, reject) => {
      corsOptions.origin(deniedOrigin, (error: Error | null, allowed: boolean) => {
        if (error) reject(error);
        else resolve(allowed);
      });
    });

    expect(CORS_ORIGIN_PATTERNS_TEST[0].test(previewOrigin)).toBe(true);
    expect(allowedStatic).toBe(true);
    expect(allowedPreview).toBe(true);
    expect(denied).toBe(false);
  });

  it('does not auto-start on app module import', async () => {
    await import('./app');

    expect(connectDBMock).not.toHaveBeenCalled();
  });

  it('starts server', async () => {
    const { start } = await import('./app');

    await start();

    expect(envConfigSpy).toHaveBeenCalledOnce();
    expect(connectDBMock).toHaveBeenCalledOnce();
    expect(appMock.listen).toHaveBeenCalledOnce();
    expect(appMock.listen).toHaveBeenCalledWith({ port: PORT_TEST, host: '0.0.0.0' });
    expect(consoleLogSpy).toHaveBeenCalledWith(`Server running on port ${PORT_TEST}`);
  });

  it('logs and exits when listen fails', async () => {
    const error = new Error('listen failed');
    appMock.listen.mockRejectedValue(error);
    const processExitSpy = vi
      .spyOn(process, 'exit')
      .mockImplementation(() => undefined as never);
    const { start } = await import('./app');

    await start();

    expect(envConfigSpy).toHaveBeenCalledOnce();
    expect(appMock.log.error).toHaveBeenCalledOnce();
    expect(appMock.log.error).toHaveBeenCalledWith(error);
    expect(processExitSpy).toHaveBeenCalledOnce();
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });
});
