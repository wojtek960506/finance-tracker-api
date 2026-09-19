import * as investmentServices from '@investment/services';
import Fastify from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { registerErrorHandler } from '@app/plugins/errorHandler';
import { USER_ID_STR } from '@testing/factories/general';

import { summaryRoutes } from './summary-routes';

const { getInvestmentSummaryMock } = vi.hoisted(() => ({
  getInvestmentSummaryMock: vi.fn(),
}));

const mockPreHandler = vi.fn(async (req, _res) => {
  (req as any).userId = USER_ID_STR;
});

vi.mock('@auth/services', () => ({
  authorizeAccessToken: vi.fn(() => mockPreHandler),
}));

vi.mock('@investment/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@investment/services')>();
  return {
    ...actual,
    getInvestmentSummary: getInvestmentSummaryMock,
  };
});

describe('summary routes', async () => {
  const app = Fastify().withTypeProvider<ZodTypeProvider>();
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.register(summaryRoutes);
  await registerErrorHandler(app);

  const mockSummaryResponse = {
    totalsByCurrency: {
      USD: {
        currency: 'USD',
        totalCurrentValue: 12500,
        totalNetInvested: 10000,
        totalBought: 10000,
        totalSold: 0,
        totalInterest: 0,
        totalFees: 0,
        totalPnL: 2500,
        roiPercentage: 25,
        instrumentsCount: 1,
      },
    },
    instruments: [
      {
        id: '507f1f77bcf86cd799439012',
        name: 'Apple Inc.',
        kind: 'share' as const,
        currency: 'USD',
        currentValue: 12500,
        netInvested: 10000,
        totalBought: 10000,
        totalSold: 0,
        totalInterest: 0,
        totalFees: 0,
        pnl: 2500,
        roiPercentage: 25,
        lastSnapshotDate: new Date('2026-09-17T00:00:00.000Z').toISOString(),
        operationsCount: 2,
        notes: 'Tech stock',
        createdAt: new Date('2026-01-01T00:00:00.000Z').toISOString(),
        updatedAt: new Date('2026-09-17T00:00:00.000Z').toISOString(),
      },
    ],
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('GET / - returns investment summary for authenticated user', async () => {
    getInvestmentSummaryMock.mockResolvedValue(mockSummaryResponse);

    const response = await app.inject({
      method: 'GET',
      url: '/',
    });

    expect(investmentServices.getInvestmentSummary).toHaveBeenCalledWith(USER_ID_STR, {});
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(mockSummaryResponse);
  });

  it('GET /?baseCurrency=PLN - passes baseCurrency query param', async () => {
    const mockNormalizedResponse = {
      ...mockSummaryResponse,
      baseCurrency: 'PLN',
      grandTotalNormalized: {
        currentValue: 50000,
        netInvested: 40000,
        pnl: 10000,
        roiPercentage: 25,
      },
    };
    getInvestmentSummaryMock.mockResolvedValue(mockNormalizedResponse);

    const response = await app.inject({
      method: 'GET',
      url: '/?baseCurrency=PLN',
    });

    expect(investmentServices.getInvestmentSummary).toHaveBeenCalledWith(USER_ID_STR, {
      baseCurrency: 'PLN',
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(mockNormalizedResponse);
  });
});
