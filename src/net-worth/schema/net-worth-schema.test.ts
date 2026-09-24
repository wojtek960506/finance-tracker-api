import { describe, expect, it } from 'vitest';

import {
  NetWorthAllocationItemSchema,
  NetWorthCurrencyBreakdownSchema,
  NetWorthIndependenceQuerySchema,
  NetWorthIndependenceResponseSchema,
  NetWorthQuerySchema,
  NetWorthResponseSchema,
  NetWorthTotalsSchema,
} from './net-worth-schema';

describe('net worth schemas', () => {
  it('validates query schema', () => {
    expect(NetWorthQuerySchema.parse({})).toEqual({});
    expect(NetWorthQuerySchema.parse({ baseCurrency: 'EUR' })).toEqual({
      baseCurrency: 'EUR',
    });
  });

  it('validates totals schema', () => {
    const totals = {
      total: 150000,
      liquidCash: 55000,
      investments: 95000,
    };
    expect(NetWorthTotalsSchema.parse(totals)).toEqual(totals);
  });

  it('validates currency breakdown schema', () => {
    const item = {
      currency: 'USD' as const,
      cash: 5000,
      investments: 10000,
      total: 15000,
      normalizedTotal: 60000,
    };
    expect(NetWorthCurrencyBreakdownSchema.parse(item)).toEqual(item);
  });

  it('validates allocation item schema', () => {
    const alloc = {
      category: 'share' as const,
      amount: 40000,
      percentage: 26.67,
    };
    expect(NetWorthAllocationItemSchema.parse(alloc)).toEqual(alloc);
  });

  it('validates full net worth response schema', () => {
    const response = {
      baseCurrency: 'PLN' as const,
      netWorth: {
        total: 150000,
        liquidCash: 55000,
        investments: 95000,
      },
      byCurrency: {
        PLN: {
          currency: 'PLN' as const,
          cash: 35000,
          investments: 55000,
          total: 90000,
          normalizedTotal: 90000,
        },
        USD: {
          currency: 'USD' as const,
          cash: 5000,
          investments: 10000,
          total: 15000,
          normalizedTotal: 60000,
        },
      },
      allocation: {
        cash: {
          category: 'cash' as const,
          amount: 55000,
          percentage: 36.67,
        },
        share: {
          category: 'share' as const,
          amount: 40000,
          percentage: 26.67,
        },
      },
    };

    expect(NetWorthResponseSchema.parse(response)).toEqual(response);
  });

  it('validates independence query schema with comma separated values', () => {
    const parsed = NetWorthIndependenceQuerySchema.parse({
      baseCurrency: 'PLN',
      periodMonths: '12',
      excludeCategoryIds: '60d0fe4f5311236168a109ca,60d0fe4f5311236168a109cb',
      excludeCategoryNames: 'praca, work , salary',
    });

    expect(parsed).toEqual({
      baseCurrency: 'PLN',
      periodMonths: 12,
      excludeCategoryIds: ['60d0fe4f5311236168a109ca', '60d0fe4f5311236168a109cb'],
      excludeCategoryNames: ['praca', 'work', 'salary'],
    });
  });

  it('validates full independence response schema', () => {
    const response = {
      baseCurrency: 'PLN' as const,
      period: {
        startDate: '2025-09-19T00:00:00.000Z',
        endDate: '2026-09-19T00:00:00.000Z',
        monthsCount: 12,
      },
      netWorth: {
        total: 231200,
        liquidCash: 61200,
        savings: 30000,
        liquidCapital: 91200,
        lockedInvestments: 140000,
      },
      monthlyAverages: {
        grossExpenses: 6000,
        nonWorkIncome: 500,
        workIncome: 12000,
        totalIncome: 12500,
        netBurnRate: 5500,
      },
      independence: {
        netWorthMonths: 42.0,
        liquidCapitalMonths: 16.58,
        liquidCashMonths: 11.13,
        isPerpetual: false,
      },
      zeroIncomeBaseline: {
        netWorthMonths: 38.53,
        liquidCapitalMonths: 15.2,
        liquidCashMonths: 10.2,
      },
      excludedCategories: [
        {
          id: '60d0fe4f5311236168a109ca',
          name: 'Praca',
        },
      ],
    };

    expect(NetWorthIndependenceResponseSchema.parse(response)).toEqual(response);
  });
});
