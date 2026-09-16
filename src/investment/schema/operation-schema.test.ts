import { describe, expect, it } from 'vitest';

import {
  InvestmentCashFlowOperationResponseSchema,
  InvestmentCashFlowOperationSchema,
  InvestmentOperationResponseSchema,
  InvestmentOperationSchema,
  InvestmentOperationsQuerySchema,
  InvestmentSnapshotOperationResponseSchema,
  InvestmentSnapshotOperationSchema,
} from './operation-schema';

describe('investment operation schema', () => {
  const instrumentId = '123456789012345678901234';
  const transactionId = '123456789012345678901235';
  const ownerId = '123456789012345678901236';
  const operationId = '123456789012345678901237';

  it('requires transactionId for cash flow investment operation', () => {
    expect(() =>
      InvestmentOperationSchema.parse({
        instrumentId,
        kind: 'buy',
        amount: 100,
        currency: 'PLN',
        date: '2026-06-06',
      }),
    ).toThrow();
  });

  it('validates cash flow investment operation with transactionId', () => {
    const parsed = InvestmentOperationSchema.parse({
      instrumentId,
      transactionId,
      kind: 'buy',
      amount: 100,
      currency: 'PLN',
      date: '2026-06-06',
    });
    expect(parsed).toEqual({
      instrumentId,
      transactionId,
      kind: 'buy',
      amount: 100,
      currency: 'PLN',
      date: new Date('2026-06-06'),
    });
  });

  it('allows snapshot investment operation without transactionId', () => {
    expect(
      InvestmentOperationSchema.parse({
        instrumentId,
        kind: 'snapshot',
        amount: 100,
        currency: 'PLN',
        date: '2026-06-06',
      }),
    ).toEqual({
      instrumentId,
      kind: 'snapshot',
      amount: 100,
      currency: 'PLN',
      date: new Date('2026-06-06'),
    });
  });

  it('validates snapshot create DTO', () => {
    expect(
      InvestmentSnapshotOperationSchema.parse({
        instrumentId,
        amount: 500,
        currency: 'USD',
        date: '2026-07-01',
      }),
    ).toEqual({
      instrumentId,
      amount: 500,
      currency: 'USD',
      date: new Date('2026-07-01'),
    });
  });

  it('validates direct cash flow schema', () => {
    expect(() =>
      InvestmentCashFlowOperationSchema.parse({
        instrumentId,
        transactionId,
        kind: 'dividend' as any,
      }),
    ).toThrow();

    expect(
      InvestmentCashFlowOperationSchema.parse({
        instrumentId,
        transactionId,
        kind: 'fee',
        amount: 25,
        currency: 'EUR',
        date: '2026-08-01',
      }),
    ).toEqual({
      instrumentId,
      transactionId,
      kind: 'fee',
      amount: 25,
      currency: 'EUR',
      date: new Date('2026-08-01'),
    });
  });

  it('validates discriminated response schemas', () => {
    const cashFlowResponse = InvestmentOperationResponseSchema.parse({
      id: operationId,
      ownerId,
      instrumentId,
      transactionId,
      kind: 'interest',
      amount: 40,
      currency: 'PLN',
      date: '2026-09-01',
      createdAt: '2026-09-01T10:00:00.000Z',
      updatedAt: '2026-09-01T10:00:00.000Z',
    });
    expect(cashFlowResponse.kind).toBe('interest');
    if (cashFlowResponse.kind !== 'snapshot') {
      expect(cashFlowResponse.transactionId).toBe(transactionId);
    }

    const snapshotResponse = InvestmentOperationResponseSchema.parse({
      id: operationId,
      ownerId,
      instrumentId,
      kind: 'snapshot',
      amount: 10000,
      currency: 'PLN',
      date: '2026-09-01',
      createdAt: '2026-09-01T10:00:00.000Z',
      updatedAt: '2026-09-01T10:00:00.000Z',
    });
    expect(snapshotResponse.kind).toBe('snapshot');
    expect('transactionId' in snapshotResponse).toBe(false);
  });

  it('validates operations query schema', () => {
    expect(
      InvestmentOperationsQuerySchema.parse({
        instrumentId,
        kind: 'buy',
      }),
    ).toEqual({
      instrumentId,
      kind: 'buy',
    });
  });
});
