import * as netWorthServices from '@net-worth/services';
import Fastify from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { registerErrorHandler } from '@app/plugins/errorHandler';
import { USER_ID_STR } from '@testing/factories/general';

import { netWorthRoutes } from './net-worth-routes';

const { getNetWorthMock } = vi.hoisted(() => ({
  getNetWorthMock: vi.fn(),
}));

const mockPreHandler = vi.fn(async (req, _res) => {
  (req as any).userId = USER_ID_STR;
});

vi.mock('@auth/services', () => ({
  authorizeAccessToken: vi.fn(() => mockPreHandler),
}));

vi.mock('@net-worth/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@net-worth/services')>();
  return {
    ...actual,
    getNetWorth: getNetWorthMock,
  };
});

describe('net worth routes', async () => {
  const app = Fastify().withTypeProvider<ZodTypeProvider>();
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.register(netWorthRoutes);
  await registerErrorHandler(app);

  const mockNetWorthResponse = {
    baseCurrency: 'PLN',
    netWorth: {
      total: 150000,
      liquidCash: 55000,
      investments: 95000,
    },
    byCurrency: {
      PLN: {
        currency: 'PLN',
        cash: 35000,
        investments: 55000,
        total: 90000,
        normalizedTotal: 90000,
      },
      USD: {
        currency: 'USD',
        cash: 5000,
        investments: 10000,
        total: 15000,
        normalizedTotal: 60000,
      },
    },
    allocation: {
      cash: {
        category: 'cash',
        amount: 55000,
        percentage: 36.67,
      },
      share: {
        category: 'share',
        amount: 40000,
        percentage: 26.67,
      },
    },
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('GET / - returns net worth for authenticated user without query', async () => {
    getNetWorthMock.mockResolvedValue(mockNetWorthResponse);

    const response = await app.inject({
      method: 'GET',
      url: '/',
    });

    expect(netWorthServices.getNetWorth).toHaveBeenCalledWith(USER_ID_STR, {});
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(mockNetWorthResponse);
  });

  it('GET /?baseCurrency=PLN - passes baseCurrency query parameter', async () => {
    getNetWorthMock.mockResolvedValue(mockNetWorthResponse);

    const response = await app.inject({
      method: 'GET',
      url: '/?baseCurrency=PLN',
    });

    expect(netWorthServices.getNetWorth).toHaveBeenCalledWith(USER_ID_STR, {
      baseCurrency: 'PLN',
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(mockNetWorthResponse);
  });
});
