import { afterEach, describe, expect, it, Mock, vi } from 'vitest';

import { STANDARD_TXN_ID_STR } from '@testing/factories/transaction';
import { TransactionModel } from '@transaction/model';
import { withSession } from '@utils/with-session';

import {
  updateTransactionsDeletion,
  updateTransactionsDeletionByFilter,
  updateTransactionsDeletionByFilterCore,
  updateTransactionsDeletionCore,
} from './update-transactions-deletion';

vi.mock('@utils/with-session', () => ({
  withSession: vi
    .fn()
    .mockImplementation(async (func, ...args) => func({} as any, ...args)),
}));

vi.mock('@transaction/model', () => ({
  TransactionModel: {
    bulkWrite: vi.fn(),
    updateMany: vi.fn(),
  },
}));

describe('updateTransactionsDeletion', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty update result when there are no updates', async () => {
    const result = await updateTransactionsDeletionCore({} as any, []);

    expect(TransactionModel.bulkWrite).not.toHaveBeenCalled();
    expect(result).toEqual({
      acknowledged: true,
      matchedCount: 0,
      modifiedCount: 0,
    });
  });

  it('updates deletion for provided transaction ids', async () => {
    const deletion = {
      deletedAt: new Date('2026-01-01'),
      purgeAt: new Date('2026-02-01'),
    };
    (TransactionModel.bulkWrite as Mock).mockResolvedValue({
      matchedCount: 1,
      modifiedCount: 1,
    });

    const result = await updateTransactionsDeletionCore({ test: true } as any, [
      { id: STANDARD_TXN_ID_STR, deletion },
    ]);

    expect(TransactionModel.bulkWrite).toHaveBeenCalledOnce();
    expect(TransactionModel.bulkWrite).toHaveBeenCalledWith(
      [
        {
          updateOne: {
            filter: { _id: expect.anything() },
            update: { $set: { deletion } },
          },
        },
      ],
      { session: { test: true } },
    );
    expect(
      (
        (TransactionModel.bulkWrite as Mock).mock.calls[0][0][0].updateOne.filter._id as {
          toString: () => string;
        }
      ).toString(),
    ).toBe(STANDARD_TXN_ID_STR);
    expect(result).toEqual({
      acknowledged: true,
      matchedCount: 1,
      modifiedCount: 1,
    });
  });

  it('uses withSession wrapper for updateTransactionsDeletion', async () => {
    (TransactionModel.bulkWrite as Mock).mockResolvedValue({
      matchedCount: 1,
      modifiedCount: 1,
    });

    await updateTransactionsDeletion([{ id: STANDARD_TXN_ID_STR, deletion: null }]);

    expect(withSession).toHaveBeenCalledOnce();
  });

  it('updates deletion by filter', async () => {
    const filter = { ownerId: 'user-1' } as any;
    const deletion = {
      deletedAt: new Date('2026-01-01'),
      purgeAt: new Date('2026-02-01'),
    };
    (TransactionModel.updateMany as Mock).mockResolvedValue({
      matchedCount: 2,
      modifiedCount: 2,
    });

    const result = await updateTransactionsDeletionByFilterCore(
      { test: true } as any,
      filter,
      deletion,
    );

    expect(TransactionModel.updateMany).toHaveBeenCalledOnce();
    expect(TransactionModel.updateMany).toHaveBeenCalledWith(
      filter,
      { $set: { deletion } },
      { session: { test: true } },
    );
    expect(result).toEqual({
      acknowledged: true,
      matchedCount: 2,
      modifiedCount: 2,
    });
  });

  it('uses withSession wrapper for updateTransactionsDeletionByFilter', async () => {
    (TransactionModel.updateMany as Mock).mockResolvedValue({
      matchedCount: 1,
      modifiedCount: 1,
    });

    await updateTransactionsDeletionByFilter({ ownerId: 'user-1' } as any, null);

    expect(withSession).toHaveBeenCalledOnce();
  });
});
