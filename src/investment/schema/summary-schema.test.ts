import { describe, expect, it } from 'vitest';

import {
  InvestmentCurrencySummarySchema,
  InvestmentInstrumentSummarySchema,
  InvestmentSummaryResponseSchema,
} from './summary-schema';

describe('investment summary schema', () => {
  const instrumentSummary = {
    id: '123456789012345678901234',
    name: 'Apple Inc.',
    kind: 'share' as const,
    currency: 'USD' as const,
    currentValue: 12500,
    netInvested: 10000,
    totalBought: 10000,
    totalSold: 0,
    totalInterest: 0,
    totalFees: 0,
    pnl: 2500,
    roiPercentage: 25,
    lastSnapshotDate: '2026-09-17T00:00:00.000Z',
    operationsCount: 2,
    notes: 'Long term hold',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-09-17T00:00:00.000Z',
  };

  const currencySummary = {
    currency: 'USD' as const,
    totalCurrentValue: 12500,
    totalNetInvested: 10000,
    totalBought: 10000,
    totalSold: 0,
    totalInterest: 0,
    totalFees: 0,
    totalPnL: 2500,
    roiPercentage: 25,
    instrumentsCount: 1,
  };

  it('validates instrument summary schema', () => {
    const parsed = InvestmentInstrumentSummarySchema.parse(instrumentSummary);
    expect(parsed.id).toBe('123456789012345678901234');
    expect(parsed.name).toBe('Apple Inc.');
    expect(parsed.lastSnapshotDate).toEqual(new Date('2026-09-17T00:00:00.000Z'));
  });

  it('validates currency summary schema', () => {
    const parsed = InvestmentCurrencySummarySchema.parse(currencySummary);
    expect(parsed.currency).toBe('USD');
    expect(parsed.totalCurrentValue).toBe(12500);
  });

  it('validates overall summary response schema', () => {
    const response = {
      totalsByCurrency: {
        USD: currencySummary,
      },
      instruments: [instrumentSummary],
    };

    const parsed = InvestmentSummaryResponseSchema.parse(response);
    expect(parsed.totalsByCurrency.USD.totalPnL).toBe(2500);
    expect(parsed.instruments).toHaveLength(1);
  });
});
