import { describe, expect, it } from 'vitest';

import {
  InvestmentOperationSchema,
  InvestmentOperationsQuerySchema,
  InvestmentSnapshotOperationSchema,
} from './operation-schema';

describe('investment operation schema', () => {
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

  it('validates snapshot create DTO', () => {
    expect(
      InvestmentSnapshotOperationSchema.parse({
        instrumentId: '123456789012345678901234',
        amount: 500,
        currency: 'USD',
        date: '2026-07-01',
      }),
    ).toEqual({
      instrumentId: '123456789012345678901234',
      amount: 500,
      currency: 'USD',
      date: new Date('2026-07-01'),
    });
  });

  it('validates operations query schema', () => {
    expect(
      InvestmentOperationsQuerySchema.parse({
        instrumentId: '123456789012345678901234',
        kind: 'buy',
      }),
    ).toEqual({
      instrumentId: '123456789012345678901234',
      kind: 'buy',
    });
  });
});
