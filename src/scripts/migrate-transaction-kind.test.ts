import { Types } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { runTransactionKindMigration } from './migrate-transaction-kind';

vi.mock('@named-resource', () => ({
  getNamedResourceModel: vi.fn().mockReturnValue({
    findOne: vi.fn().mockImplementation(({ name }: { name: string }) => {
      if (name === 'exchange') {
        return Promise.resolve({ _id: new Types.ObjectId('111111111111111111111111') });
      }
      if (name === 'myAccount') {
        return Promise.resolve({ _id: new Types.ObjectId('222222222222222222222222') });
      }
      if (name === 'investment') {
        return Promise.resolve({ _id: new Types.ObjectId('333333333333333333333333') });
      }
      return Promise.resolve(null);
    }),
  }),
}));

vi.mock('@transaction/model', () => ({
  TransactionModel: {
    updateMany: vi.fn().mockResolvedValue({ modifiedCount: 5 }),
  },
}));

describe('runTransactionKindMigration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('runs migration across exchange, transfer, investment and standard transactions', async () => {
    const result = await runTransactionKindMigration();

    expect(result).toEqual({
      exchangeCount: 5,
      transferCount: 5,
      investmentCount: 5,
      standardCount: 5,
    });
  });
});
