import * as dashboardServices from '@dashboard/services';
import Fastify from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { registerErrorHandler } from '@app/plugins/errorHandler';
import { USER_ID_STR } from '@testing/factories/general';

import { dashboardRoutes } from './dashboard-routes';

const { getDashboardSummaryMock } = vi.hoisted(() => ({
  getDashboardSummaryMock: vi.fn(),
}));

const mockPreHandler = vi.fn(async (req, _res) => {
  (req as any).userId = USER_ID_STR;
});

vi.mock('@auth/services', () => ({
  authorizeAccessToken: vi.fn(() => mockPreHandler),
}));

vi.mock('@dashboard/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@dashboard/services')>();
  return {
    ...actual,
    getDashboardSummary: getDashboardSummaryMock,
  };
});

describe('dashboard routes', async () => {
  const app = Fastify().withTypeProvider<ZodTypeProvider>();
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.register(dashboardRoutes);
  await registerErrorHandler(app);

  const mockResponse = {
    baseCurrency: 'PLN' as const,
    transactions: {
      totalItems: 142,
      totalExpenseAmount: 15840.5,
      totalIncomeAmount: 28400,
      byCurrency: {
        PLN: {
          totalItems: 130,
          totalExpenseAmount: 14200.5,
          totalIncomeAmount: 28400,
        },
      },
    },
    investments: {
      totalCurrentValue: 54200.75,
      totalNetInvested: 48000,
      totalPnL: 6200.75,
      roiPercentage: 12.92,
      instrumentsCount: 8,
    },
    vehicles: {
      totalVehicles: 2,
      totalSpentPln: 8450.2,
      totalFuelSpentPln: 4820,
      totalMaintenanceSpentPln: 2980.2,
      totalEquipmentSpentPln: 650,
    },
    sports: {
      totalCostPln: 1820,
      totalEntries: 46,
      categoriesCount: 3,
    },
    recentTransactions: [],
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('GET /summary - returns dashboard summary with default query params', async () => {
    getDashboardSummaryMock.mockResolvedValue(mockResponse);

    const response = await app.inject({
      method: 'GET',
      url: '/summary',
    });

    expect(dashboardServices.getDashboardSummary).toHaveBeenCalledWith(USER_ID_STR, {
      baseCurrency: 'PLN',
      recentLimit: 10,
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(mockResponse);
  });

  it('GET /summary?baseCurrency=EUR&recentLimit=5 - passes custom query params', async () => {
    getDashboardSummaryMock.mockResolvedValue({
      ...mockResponse,
      baseCurrency: 'EUR' as const,
    });

    const response = await app.inject({
      method: 'GET',
      url: '/summary?baseCurrency=EUR&recentLimit=5',
    });

    expect(dashboardServices.getDashboardSummary).toHaveBeenCalledWith(USER_ID_STR, {
      baseCurrency: 'EUR',
      recentLimit: 5,
    });
    expect(response.statusCode).toBe(200);
    expect(response.json().baseCurrency).toBe('EUR');
  });

  it('GET /summary?recentLimit=99 - returns 400 for out-of-range limit', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/summary?recentLimit=99',
    });

    expect(response.statusCode).toBe(400);
  });
});
