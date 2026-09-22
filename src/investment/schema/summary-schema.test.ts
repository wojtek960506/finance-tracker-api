import { describe, expect, it } from 'vitest';

import {
  InvestmentCurrencySummarySchema,
  InvestmentGrandTotalNormalizedSchema,
  InvestmentInstrumentSummarySchema,
  InvestmentSummaryQuerySchema,
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
    normalizedTotalCurrentValue: 50000,
    normalizedTotalNetInvested: 40000,
    normalizedTotalPnL: 10000,
  };

  it('validates query schema', () => {
    expect(InvestmentSummaryQuerySchema.parse({})).toEqual({});
    expect(InvestmentSummaryQuerySchema.parse({ baseCurrency: 'PLN' })).toEqual({
      baseCurrency: 'PLN',
    });
  });

  it('validates grand total normalized schema', () => {
    const grandTotal = {
      currentValue: 50000,
      netInvested: 40000,
      pnl: 10000,
      roiPercentage: 25,
    };
    const parsed = InvestmentGrandTotalNormalizedSchema.parse(grandTotal);
    expect(parsed.currentValue).toBe(50000);
    expect(parsed.roiPercentage).toBe(25);
  });

  it('validates instrument summary schema', () => {
    const parsed = InvestmentInstrumentSummarySchema.parse(instrumentSummary);
    expect(parsed.id).toBe('123456789012345678901234');
    expect(parsed.name).toBe('Apple Inc.');
    expect(parsed.lastSnapshotDate).toEqual(new Date('2026-09-17T00:00:00.000Z'));
  });

  it('validates currency summary schema with normalization fields', () => {
    const parsed = InvestmentCurrencySummarySchema.parse(currencySummary);
    expect(parsed.currency).toBe('USD');
    expect(parsed.totalCurrentValue).toBe(12500);
    expect(parsed.normalizedTotalCurrentValue).toBe(50000);
  });

  it('validates overall summary response schema with baseCurrency and grandTotalNormalized', () => {
    const response = {
      baseCurrency: 'PLN' as const,
      grandTotalNormalized: {
        currentValue: 50000,
        netInvested: 40000,
        pnl: 10000,
        roiPercentage: 25,
      },
      totalsByCurrency: {
        USD: currencySummary,
      },
      instruments: [instrumentSummary],
    };

    const parsed = InvestmentSummaryResponseSchema.parse(response);
    expect(parsed.baseCurrency).toBe('PLN');
    expect(parsed.grandTotalNormalized?.currentValue).toBe(50000);
    expect(parsed.totalsByCurrency.USD.totalPnL).toBe(2500);
    expect(parsed.instruments).toHaveLength(1);
  });
});
