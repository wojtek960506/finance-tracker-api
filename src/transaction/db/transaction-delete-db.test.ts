import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import { USER_ID_STR } from '@testing/factories/general';
import {
  getStandardTransactionResultSerialized,
  getTransferTransactionResultSerialized,
  STANDARD_TXN_ID_STR,
} from '@testing/factories/transaction';
import { TransactionModel } from '@transaction/model';
import { NotFoundError } from '@utils/errors';
import { withSession } from '@utils/with-session';

import { removeTransaction } from './remove-transaction/remove-transaction';
import { removeTransactions } from './remove-transactions/remove-transactions';
import {
  updateTransactionsDeletion,
  updateTransactionsDeletionByFilter,
  updateTransactionsDeletionByFilterCore,
  updateTransactionsDeletionCore,
} from './update-transactions-deletion/update-transactions-deletion';

vi.mock('@utils/with-session', () => ({
  withSession: vi
    .fn()
    .mockImplementation(async (func, ...args) => func({} as any, ...args)),
}));

vi.mock('@investment/model', () => ({
  InvestmentOperationModel: {
    bulkWrite: vi.fn(),
    updateMany: vi.fn(),
    deleteMany: vi.fn().mockResolvedValue({ deletedCount: 0 }),
  },
}));

vi.mock('@transaction/model', () => ({
  TransactionModel: {
    bulkWrite: vi.fn(),
    deleteMany: vi.fn(),
    find: vi.fn().mockResolvedValue([]),
    updateMany: vi.fn(),
  },
}));

describe('transaction-delete-db', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('removeTransaction', () => {
    const standard = getStandardTransactionResultSerialized();
    const { expenseTransactionSerialized: transfer } =
      getTransferTransactionResultSerialized();
    const resultOne = { acknowledged: true, deletedCount: 1 };
    const resultTwo = { ...resultOne, deletedCount: 2 };

    it.each([
      ['without', resultOne, standard.id, undefined, [standard.id]],
      ['with', resultTwo, transfer.id, transfer.refId, [transfer.id, transfer.refId]],
    ])(
      'remove transaction %s reference',
      async (_, expectedResult, transactionId, transactionRefId, expectedIds) => {
        (TransactionModel.deleteMany as Mock).mockResolvedValue(expectedResult);

        const result = await removeTransaction(transactionId, transactionRefId);

        expect(TransactionModel.deleteMany).toHaveBeenCalledOnce();
        expect(TransactionModel.deleteMany).toHaveBeenCalledWith(
          { _id: { $in: expectedIds } },
          expect.anything(),
        );
        expect(withSession).toHaveBeenCalledOnce();
        expect(result).toEqual(expectedResult);
      },
    );

    it('throws when removed not as much as provided but still end session', async () => {
      (TransactionModel.deleteMany as Mock).mockResolvedValue(resultTwo);

      await expect(removeTransaction(transfer.id)).rejects.toThrow(NotFoundError);

      expect(TransactionModel.deleteMany).toHaveBeenCalledOnce();
      expect(withSession).toHaveBeenCalledOnce();
    });
  });

  describe('removeTransactions', () => {
    const deleteResult = { deletedCount: 100 };

    beforeEach(() => {
      vi.mocked(TransactionModel.find).mockResolvedValue([] as any);
    });

    it.each([
      ['filter by `ownerId`', USER_ID_STR, { ownerId: USER_ID_STR }],
      ['do not filter', undefined, {}],
    ])('%s', async (_, ownerId, query) => {
      (TransactionModel.deleteMany as Mock).mockResolvedValue(deleteResult);

      const result = await removeTransactions(ownerId);

      expect(TransactionModel.deleteMany).toHaveBeenCalledOnce();
      expect(TransactionModel.deleteMany).toHaveBeenCalledWith(query);
      expect(result).toEqual(deleteResult);
    });

    it.each([
      ['active', 'active', { ownerId: USER_ID_STR, deletion: null }],
      [
        'trash',
        'trash',
        { ownerId: USER_ID_STR, 'deletion.deletedAt': { $exists: true } },
      ],
    ])('filters by deletion state %s', async (_, deletionState, query) => {
      (TransactionModel.deleteMany as Mock).mockResolvedValue(deleteResult);

      const result = await removeTransactions(USER_ID_STR, deletionState as any);

      expect(TransactionModel.deleteMany).toHaveBeenCalledOnce();
      expect(TransactionModel.deleteMany).toHaveBeenCalledWith(query);
      expect(result).toEqual(deleteResult);
    });
  });

  describe('updateTransactionsDeletion', () => {
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
          (TransactionModel.bulkWrite as Mock).mock.calls[0][0][0].updateOne.filter
            ._id as {
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

    it('throws NotFoundError if matched count does not match expected count', async () => {
      (TransactionModel.bulkWrite as Mock).mockResolvedValue({
        matchedCount: 1,
        modifiedCount: 1,
      });

      await expect(
        updateTransactionsDeletionCore(
          {} as any,
          [{ id: STANDARD_TXN_ID_STR, deletion: null }],
          2,
        ),
      ).rejects.toThrow();
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
});
