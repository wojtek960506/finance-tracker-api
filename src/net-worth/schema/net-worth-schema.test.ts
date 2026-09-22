import { describe, expect, it } from 'vitest';

import {
  NetWorthAllocationItemSchema,
  NetWorthCurrencyBreakdownSchema,
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
});
