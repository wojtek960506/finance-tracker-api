import { describe, expect, it } from 'vitest';

import { TransactionInvestmentSchema } from './transaction-schema';

describe('TransactionInvestmentSchema & TransactionInvestmentDetailsSchema', () => {
  const validInstrumentId = '507f1f77bcf86cd799439011';

  const baseTransaction = {
    amount: 1000,
    currency: 'USD',
    date: '2026-09-08',
    description: 'Buy AAPL stock',
  };

  it('validates investment with existing instrumentId', () => {
    const data = {
      ...baseTransaction,
      investment: {
        instrumentId: validInstrumentId,
        operationKind: 'buy',
        note: 'Existing instrument purchase',
      },
    };

    const parsed = TransactionInvestmentSchema.parse(data);
    expect(parsed.investment).toEqual({
      instrumentId: validInstrumentId,
      operationKind: 'buy',
      note: 'Existing instrument purchase',
    });
  });

  it('validates investment with inline newInstrument', () => {
    const data = {
      ...baseTransaction,
      investment: {
        newInstrument: {
          name: 'Apple Inc.',
          kind: 'share',
          currency: 'USD',
          notes: 'Tech company',
        },
        operationKind: 'buy',
      },
    };

    const parsed = TransactionInvestmentSchema.parse(data);
    expect(parsed.investment).toEqual({
      newInstrument: {
        name: 'Apple Inc.',
        kind: 'share',
        currency: 'USD',
        notes: 'Tech company',
      },
      operationKind: 'buy',
    });
  });

  it('fails when neither instrumentId nor newInstrument is provided', () => {
    const data = {
      ...baseTransaction,
      investment: {
        operationKind: 'buy',
        note: 'Missing instrument',
      },
    };

    expect(() => TransactionInvestmentSchema.parse(data)).toThrow();
  });

  it('fails when both instrumentId and newInstrument are provided', () => {
    const data = {
      ...baseTransaction,
      investment: {
        instrumentId: validInstrumentId,
        newInstrument: {
          name: 'Apple Inc.',
          kind: 'share',
        },
        operationKind: 'buy',
      },
    };

    expect(() => TransactionInvestmentSchema.parse(data)).toThrow();
  });

  it('fails when investment object is missing entirely', () => {
    const data = {
      ...baseTransaction,
    };

    expect(() => TransactionInvestmentSchema.parse(data)).toThrow();
  });

  it('fails when instrumentId has invalid ObjectId format', () => {
    const data = {
      ...baseTransaction,
      investment: {
        instrumentId: 'invalid-id',
        operationKind: 'buy',
      },
    };

    expect(() => TransactionInvestmentSchema.parse(data)).toThrow();
  });

  it('fails when operationKind is invalid', () => {
    const data = {
      ...baseTransaction,
      investment: {
        instrumentId: validInstrumentId,
        operationKind: 'invalid_kind',
      },
    };

    expect(() => TransactionInvestmentSchema.parse(data)).toThrow();
  });
});
