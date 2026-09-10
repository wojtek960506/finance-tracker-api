import { Types } from 'mongoose';
import { describe, expect, it } from 'vitest';

import { InvestmentInstrumentModel, InvestmentOperationModel } from './investment-model';

describe('investment model', () => {
  it('accepts snapshot operation without transaction', () => {
    const doc = new InvestmentOperationModel({
      ownerId: new Types.ObjectId(),
      instrumentId: new Types.ObjectId(),
      kind: 'snapshot',
      amount: 777,
      currency: 'PLN',
      date: new Date('2026-06-06'),
    });

    expect(doc.validateSync()).toBeUndefined();
  });

  it('rejects non-snapshot operation without transaction', () => {
    const doc = new InvestmentOperationModel({
      ownerId: new Types.ObjectId(),
      instrumentId: new Types.ObjectId(),
      kind: 'buy',
      amount: 777,
      currency: 'PLN',
      date: new Date('2026-06-06'),
    });

    const error = doc.validateSync();

    expect(error?.errors.transactionId).toBeDefined();
  });

  it('accepts operation with deletion info', () => {
    const doc = new InvestmentOperationModel({
      ownerId: new Types.ObjectId(),
      instrumentId: new Types.ObjectId(),
      transactionId: new Types.ObjectId(),
      kind: 'buy',
      amount: 777,
      currency: 'PLN',
      date: new Date('2026-06-06'),
      deletion: {
        deletedAt: new Date('2026-06-07'),
        purgeAt: new Date('2026-07-07'),
      },
    });

    expect(doc.validateSync()).toBeUndefined();
  });

  it('accepts investment instrument', () => {
    const doc = new InvestmentInstrumentModel({
      ownerId: new Types.ObjectId(),
      name: 'VWCE ETF',
      nameNormalized: 'vwce etf',
      kind: 'fund',
      currency: 'PLN',
    });

    expect(doc.validateSync()).toBeUndefined();
  });
});
