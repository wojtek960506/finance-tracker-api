import { describe, expect, it } from 'vitest';

import {
  InvestmentInstrumentSchema,
  InvestmentOperationSchema,
} from './investment-schema';

describe('investment schema', () => {
  it('parses investment instrument', () => {
    expect(
      InvestmentInstrumentSchema.parse({
        name: 'VWCE ETF',
        kind: 'fund',
        currency: 'PLN',
      }),
    ).toEqual({
      name: 'VWCE ETF',
      kind: 'fund',
      currency: 'PLN',
    });
  });

  it('requires transaction for non-snapshot investment operation', () => {
    expect(() =>
      InvestmentOperationSchema.parse({
        instrumentId: '123456789012345678901234',
        kind: 'buy',
        amount: 100,
        currency: 'PLN',
        date: '2026-06-06',
      }),
    ).toThrow('Transaction is required for non-snapshot investment operations');
  });

  it('rejects snapshot investment operation with transaction', () => {
    expect(() =>
      InvestmentOperationSchema.parse({
        instrumentId: '123456789012345678901234',
        transactionId: '123456789012345678901234',
        kind: 'snapshot',
        amount: 100,
        currency: 'PLN',
        date: '2026-06-06',
      }),
    ).toThrow('Snapshot operation cannot be bound to a transaction');
  });

  it('allows snapshot investment operation without transaction', () => {
    expect(
      InvestmentOperationSchema.parse({
        instrumentId: '123456789012345678901234',
        kind: 'snapshot',
        amount: 100,
        currency: 'PLN',
        date: '2026-06-06',
      }),
    ).toEqual({
      instrumentId: '123456789012345678901234',
      kind: 'snapshot',
      amount: 100,
      currency: 'PLN',
      date: new Date('2026-06-06'),
    });
  });
});

