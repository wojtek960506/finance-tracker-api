import Fastify from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { registerErrorHandler } from '@app/plugins/errorHandler';
import { USER_ID_STR } from '@testing/factories/general';

import { sportStatsRoutes } from './sport-stats-routes';

const { getSportStatsImpl } = vi.hoisted(() => ({
  getSportStatsImpl: vi.fn(),
}));

const mockPreHandler = vi.fn(async (req, _res) => {
  (req as any).userId = USER_ID_STR;
});

vi.mock('@auth/services', () => ({
  authorizeAccessToken: vi.fn(() => mockPreHandler),
}));

vi.mock('../services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services')>();
  return {
    ...actual,
    getSportStats: getSportStatsImpl,
  };
});

const buildTestApp = () => {
  const app = Fastify({ logger: false }).withTypeProvider<ZodTypeProvider>();
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  registerErrorHandler(app);
  app.register(sportStatsRoutes);
  return app;
};

describe('sportStatsRoutes', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('GET / returns 200 and stats without year filter', async () => {
    const app = buildTestApp();
    const mockStatsResponse = {
      totalCostPln: 150.5,
      totalEntries: 2,
      byCategory: [
        {
          categoryId: '65f1a2b3c4d5e6f7a8b9c0d1',
          categoryName: 'Gym',
          categoryKey: null,
          type: 'user' as const,
          totalCostPln: 150.5,
          entryCount: 2,
          percentage: 100,
        },
      ],
      byYear: [
        {
          year: 2024,
          totalCostPln: 150.5,
          entryCount: 2,
        },
      ],
      byMonth: [
        {
          year: 2024,
          month: 1,
          totalCostPln: 150.5,
          entryCount: 2,
        },
      ],
    };

    getSportStatsImpl.mockResolvedValueOnce(mockStatsResponse);

    const response = await app.inject({
      method: 'GET',
      url: '/',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(mockStatsResponse);
    expect(getSportStatsImpl).toHaveBeenCalledWith(USER_ID_STR, {});
  });

  it('GET /?year=2024 passes year filter to service', async () => {
    const app = buildTestApp();
    const mockStatsResponse = {
      totalCostPln: 50,
      totalEntries: 1,
      byCategory: [],
      byYear: [{ year: 2024, totalCostPln: 50, entryCount: 1 }],
      byMonth: [],
    };

    getSportStatsImpl.mockResolvedValueOnce(mockStatsResponse);

    const response = await app.inject({
      method: 'GET',
      url: '/?year=2024',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(mockStatsResponse);
    expect(getSportStatsImpl).toHaveBeenCalledWith(USER_ID_STR, { year: 2024 });
  });

  it('GET /?year=invalid returns 400 validation error', async () => {
    const app = buildTestApp();

    const response = await app.inject({
      method: 'GET',
      url: '/?year=invalid-year',
    });

    expect(response.statusCode).toBe(400);
    expect(getSportStatsImpl).not.toHaveBeenCalled();
  });

  it('GET /?year=1900 returns 400 validation error (out of min range)', async () => {
    const app = buildTestApp();

    const response = await app.inject({
      method: 'GET',
      url: '/?year=1900',
    });

    expect(response.statusCode).toBe(400);
    expect(getSportStatsImpl).not.toHaveBeenCalled();
  });
});
