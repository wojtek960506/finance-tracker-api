import { Types } from 'mongoose';
import { afterEach, describe, expect, it, Mock, vi } from 'vitest';

import { USER_ID_STR } from '@testing/factories/general';
import {
  getStandardTransactionResultJSON,
  getStandardTransactionResultSerialized,
  getTransferTransactionResultJSON,
  getTransferTransactionResultSerialized,
  STANDARD_TXN_ID_STR,
  TRANSFER_TXN_INCOME_ID_STR,
} from '@testing/factories/transaction';
import {
  removeTransaction,
  removeTransactions,
  updateTransactionsDeletion,
  updateTransactionsDeletionByFilter,
} from '@transaction/db';
import { serializeTrashedTransaction } from '@transaction/serializers';
import * as transactionServices from '@transaction/services';
import { loadOwnedTransactionDetails } from '@transaction/services/get-transaction';
import { loadOwnedTransactionCascade } from '@transaction/services/load-transaction-cascade';
import { NotFoundError } from '@utils/errors';

import { deleteTrashedTransaction } from './delete-trashed-transaction/delete-trashed-transaction';
import { emptyTrash } from './empty-trash/empty-trash';
import { getTrashedTransaction } from './get-trashed-transaction/get-trashed-transaction';
import { getTrashedTransactions } from './get-trashed-transactions/get-trashed-transactions';
import { listTransactions } from './list-transactions/list-transactions';
import { restoreTransaction } from './restore-transaction/restore-transaction';
import { restoreTransactions } from './restore-transactions/restore-transactions';

vi.mock('@transaction/db', () => ({
  removeTransaction: vi.fn(),
  removeTransactions: vi.fn(),
  updateTransactionsDeletion: vi.fn(),
  updateTransactionsDeletionByFilter: vi.fn(),
}));

vi.mock('@transaction/serializers', () => ({
  serializeTrashedTransaction: vi.fn(),
}));

vi.mock('@transaction/services/get-transaction', () => ({
  loadOwnedTransactionDetails: vi.fn(),
}));

vi.mock('@transaction/services/load-transaction-cascade', () => ({
  loadOwnedTransactionCascade: vi.fn(),
}));

vi.mock('./list-transactions/list-transactions', () => ({
  listTransactions: vi.fn(),
}));

describe('transaction-trash services', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getTrashedTransaction', () => {
    it('returns trashed transaction without reference', async () => {
      const transaction = getStandardTransactionResultJSON();
      const serialized = {
        ...getStandardTransactionResultSerialized(),
        deletion: {
          deletedAt: new Date('2026-01-01'),
          purgeAt: new Date('2026-02-01'),
        },
      };
      (loadOwnedTransactionDetails as Mock).mockResolvedValue({
        transaction,
        reference: undefined,
      });
      (serializeTrashedTransaction as Mock).mockReturnValue(serialized);

      const result = await getTrashedTransaction(STANDARD_TXN_ID_STR, 'user-1');

      expect(loadOwnedTransactionDetails).toHaveBeenCalledWith(
        STANDARD_TXN_ID_STR,
        'user-1',
        {
          deletionState: 'trash',
        },
      );
      expect(result).toEqual(serialized);
    });

    it('includes serialized reference when present', async () => {
      const { expenseTransactionJSON, incomeTransactionJSON } =
        getTransferTransactionResultJSON();
      const { expenseTransactionSerialized, incomeTransactionSerialized } =
        getTransferTransactionResultSerialized();
      const serialized = {
        ...expenseTransactionSerialized,
        deletion: {
          deletedAt: new Date('2026-01-01'),
          purgeAt: new Date('2026-02-01'),
        },
      };
      const serializedReference = {
        ...incomeTransactionSerialized,
        deletion: {
          deletedAt: new Date('2026-01-01'),
          purgeAt: new Date('2026-02-01'),
        },
      };
      (loadOwnedTransactionDetails as Mock).mockResolvedValue({
        transaction: expenseTransactionJSON,
        reference: incomeTransactionJSON,
      });
      (serializeTrashedTransaction as Mock)
        .mockReturnValueOnce(serialized)
        .mockReturnValueOnce(serializedReference);

      const result = await getTrashedTransaction(STANDARD_TXN_ID_STR, 'user-1');

      expect(serializeTrashedTransaction).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        ...serialized,
        reference: serializedReference,
      });
    });
  });

  describe('getTrashedTransactions', () => {
    it('builds trash filter and delegates to listTransactions', async () => {
      const query = {
        page: 1,
        limit: 10,
        sortBy: 'deletedAt',
        sortOrder: 'desc',
      } as any;
      const filter = {
        ownerId: USER_ID_STR,
        'deletion.deletedAt': { $exists: true },
      };
      const response = { page: 1, limit: 10, total: 0, totalPages: 0, items: [] };
      vi.spyOn(transactionServices, 'buildTransactionFilterQuery').mockReturnValue(
        filter as any,
      );
      (listTransactions as Mock).mockResolvedValue(response);

      const result = await getTrashedTransactions(query, USER_ID_STR);

      expect(transactionServices.buildTransactionFilterQuery).toHaveBeenCalledWith(
        query,
        USER_ID_STR,
        'trash',
      );
      expect(listTransactions).toHaveBeenCalledOnce();
      expect((listTransactions as Mock).mock.calls[0][0]).toEqual(
        expect.objectContaining({
          filter,
          query,
          userId: USER_ID_STR,
          serialize: expect.any(Function),
        }),
      );
      expect(result).toEqual(response);
    });
  });

  describe('deleteTrashedTransaction', () => {
    it('deletes selected trashed transaction and its reference', async () => {
      const result = { acknowledged: true, deletedCount: 2 };
      (loadOwnedTransactionCascade as Mock).mockResolvedValue({
        transaction: { _id: { toString: () => STANDARD_TXN_ID_STR } },
        reference: { _id: { toString: () => TRANSFER_TXN_INCOME_ID_STR } },
      });
      (removeTransaction as Mock).mockResolvedValue(result);

      const response = await deleteTrashedTransaction(STANDARD_TXN_ID_STR, 'user-1');

      expect(loadOwnedTransactionCascade).toHaveBeenCalledWith(
        STANDARD_TXN_ID_STR,
        'user-1',
        {
          deletionState: 'trash',
        },
      );
      expect(removeTransaction).toHaveBeenCalledWith(
        STANDARD_TXN_ID_STR,
        TRANSFER_TXN_INCOME_ID_STR,
      );
      expect(response).toEqual(result);
    });
  });

  describe('restoreTransaction', () => {
    it('restores all ids from cascade', async () => {
      const result = { acknowledged: true, matchedCount: 2, modifiedCount: 2 };
      (loadOwnedTransactionCascade as Mock).mockResolvedValue({
        ids: [STANDARD_TXN_ID_STR, TRANSFER_TXN_INCOME_ID_STR],
      });
      (updateTransactionsDeletion as Mock).mockResolvedValue(result);

      const response = await restoreTransaction(STANDARD_TXN_ID_STR, USER_ID_STR);

      expect(loadOwnedTransactionCascade).toHaveBeenCalledWith(
        STANDARD_TXN_ID_STR,
        USER_ID_STR,
        {
          deletionState: 'trash',
        },
      );
      expect(updateTransactionsDeletion).toHaveBeenCalledWith(
        [
          { id: STANDARD_TXN_ID_STR, deletion: null },
          { id: TRANSFER_TXN_INCOME_ID_STR, deletion: null },
        ],
        2,
      );
      expect(response).toEqual(result);
    });

    it('re-throws when updateTransactionsDeletion fails', async () => {
      (loadOwnedTransactionCascade as Mock).mockResolvedValue({
        ids: [STANDARD_TXN_ID_STR, TRANSFER_TXN_INCOME_ID_STR],
      });
      (updateTransactionsDeletion as Mock).mockRejectedValue(
        new NotFoundError('Transaction not found'),
      );

      await expect(restoreTransaction(STANDARD_TXN_ID_STR, USER_ID_STR)).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe('restoreTransactions', () => {
    it('restores all trashed transactions for user', async () => {
      const result = { acknowledged: true, matchedCount: 3, modifiedCount: 3 };
      (updateTransactionsDeletionByFilter as Mock).mockResolvedValue(result);

      const response = await restoreTransactions(USER_ID_STR);

      expect(updateTransactionsDeletionByFilter).toHaveBeenCalledWith(
        {
          ownerId: expect.any(Types.ObjectId),
          'deletion.deletedAt': { $exists: true },
        },
        null,
      );
      expect(
        (
          (updateTransactionsDeletionByFilter as Mock).mock.calls[0][0]
            .ownerId as Types.ObjectId
        ).toString(),
      ).toBe(USER_ID_STR);
      expect(response).toEqual(result);
    });
  });

  describe('emptyTrash', () => {
    it('removes only trashed transactions', async () => {
      const result = { acknowledged: true, deletedCount: 5 };
      (removeTransactions as Mock).mockResolvedValue(result);

      const response = await emptyTrash(USER_ID_STR);

      expect(removeTransactions).toHaveBeenCalledWith(USER_ID_STR, 'trash');
      expect(response).toEqual(result);
    });
  });
});
