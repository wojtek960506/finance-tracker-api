import { afterEach, describe, expect, it, Mock, vi } from 'vitest';

import {
  EXCHANGE_CATEGORY_ID_STR,
  EXCHANGE_CATEGORY_NAME,
  FOOD_CATEGORY_ID_STR,
  TRANSFER_CATEGORY_ID_STR,
  TRANSFER_CATEGORY_NAME,
} from '@testing/factories/category';
import { USER_ID_STR } from '@testing/factories/general';
import {
  EXCHANGE_TXN_EXPENSE_ID_STR,
  EXCHANGE_TXN_INCOME_ID_STR,
  getExchangeTransactionNotPopulatedResultJSON,
  getStandardTransactionResultJSON,
  STANDARD_TXN_ID_STR,
  TRANSACTION_TYPE_EXPENSE,
  TRANSFER_TXN_EXPENSE_ID_STR,
} from '@testing/factories/transaction';
import { SystemCategoryName } from '@transaction/db';
import { TransactionModel } from '@transaction/model';
import {
  TransactionExchangeCategoryError,
  TransactionMissingReferenceError,
  TransactionNotFoundError,
  TransactionTransferCategoryError,
  TransactionWrongReferenceError,
  TransactionWrongTypesError,
} from '@utils/errors';
import { randomObjectIdString } from '@utils/random';

import {
  findTransaction,
  findTransactionNullable,
} from './find-transaction/find-transaction';
import {
  findTransactionTotalsByCurrency,
  findTransactionTotalsOverall,
} from './find-transaction-totals/find-transaction-totals';
import {
  findTransactions,
  findTransactionsCount,
} from './find-transactions/find-transactions';
import { streamTransactions } from './stream-transactions/stream-transactions';
import { findTransactionResourceIds } from './find-transaction-resource-ids';
import { loadTransactionWithReference } from './load-transaction-with-reference';

vi.mock('@transaction/model', () => ({
  TransactionModel: {
    aggregate: vi.fn(),
    countDocuments: vi.fn(),
    distinct: vi.fn(),
    find: vi.fn(),
    findOne: vi.fn(),
  },
}));

describe('transaction-find-db', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('findTransaction', () => {
    const transaction = getStandardTransactionResultJSON();

    it('transaction exists', async () => {
      (TransactionModel.findOne as Mock).mockResolvedValue(transaction);

      const result = await findTransaction(STANDARD_TXN_ID_STR);

      expect(TransactionModel.findOne).toHaveBeenCalledOnce();
      expect(TransactionModel.findOne).toHaveBeenCalledWith({
        _id: STANDARD_TXN_ID_STR,
        deletion: null,
      });
      expect(result).toEqual(transaction);
    });

    it('transaction does not exist', async () => {
      (TransactionModel.findOne as Mock).mockResolvedValue(undefined);

      await expect(findTransaction(STANDARD_TXN_ID_STR)).rejects.toThrow(
        TransactionNotFoundError,
      );

      expect(TransactionModel.findOne).toHaveBeenCalledOnce();
      expect(TransactionModel.findOne).toHaveBeenCalledWith({
        _id: STANDARD_TXN_ID_STR,
        deletion: null,
      });
    });

    it("finds trashed transaction when deletionState is 'trash'", async () => {
      (TransactionModel.findOne as Mock).mockResolvedValue(transaction);

      const result = await findTransactionNullable(STANDARD_TXN_ID_STR, {
        deletionState: 'trash',
      });

      expect(TransactionModel.findOne).toHaveBeenCalledOnce();
      expect(TransactionModel.findOne).toHaveBeenCalledWith({
        _id: STANDARD_TXN_ID_STR,
        'deletion.deletedAt': { $exists: true },
      });
      expect(result).toEqual(transaction);
    });

    it("finds transaction without deletion filter when deletionState is 'any'", async () => {
      (TransactionModel.findOne as Mock).mockResolvedValue(transaction);

      const result = await findTransactionNullable(STANDARD_TXN_ID_STR, {
        deletionState: 'any',
      });

      expect(TransactionModel.findOne).toHaveBeenCalledOnce();
      expect(TransactionModel.findOne).toHaveBeenCalledWith({
        _id: STANDARD_TXN_ID_STR,
      });
      expect(result).toEqual(transaction);
    });
  });

  describe('findTransactions', () => {
    const mockResult = ['a'];
    const mockQuery = {
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue(mockResult),
    };
    const query = { page: 1, limit: 10, sortBy: 'date', sortOrder: 'desc' } as const;
    const filter = { ownerId: randomObjectIdString() };

    it.each<['asc' | 'desc', number]>([
      ['desc', -1],
      ['asc', 1],
    ])("sort order '%s'", async (sortOrder, sortResult) => {
      (TransactionModel.find as Mock).mockReturnValue(mockQuery);

      const result = await findTransactions(filter, { ...query, sortOrder });

      expect(mockQuery.sort).toHaveBeenCalledOnce();
      expect(mockQuery.sort).toHaveBeenCalledWith({
        date: sortResult,
        sourceIndex: sortResult,
      });
      expect(mockQuery.skip).toHaveBeenCalledOnce();
      expect(mockQuery.skip).toHaveBeenCalledWith(0);
      expect(mockQuery.limit).toHaveBeenCalledOnce();
      expect(mockQuery.limit).toHaveBeenCalledWith(10);
      expect(result).toEqual(mockResult);
    });

    it.each([
      ['deletedAt', 'deletion.deletedAt'],
      ['purgeAt', 'deletion.purgeAt'],
    ])('maps %s sort to deletion field', async (sortBy, mappedSortBy) => {
      (TransactionModel.find as Mock).mockReturnValue(mockQuery);

      const result = await findTransactions(filter, {
        ...query,
        sortBy,
      });

      expect(mockQuery.sort).toHaveBeenCalledOnce();
      expect(mockQuery.sort).toHaveBeenCalledWith({
        [mappedSortBy]: -1,
        date: -1,
        sourceIndex: -1,
      });
      expect(result).toEqual(mockResult);
    });

    it('findTransactionsCount', async () => {
      const COUNT = 1;
      (TransactionModel.countDocuments as Mock).mockResolvedValue(COUNT);
      const result = await findTransactionsCount(filter);
      expect(TransactionModel.countDocuments).toHaveBeenCalledOnce();
      expect(result).toEqual(COUNT);
    });
  });

  describe('findTransactionTotals', () => {
    const RESULT = 'result';
    const FILTER = { year: 2026 };

    it('find transaction totals overall', async () => {
      (TransactionModel.aggregate as Mock).mockResolvedValue(RESULT);

      const result = await findTransactionTotalsOverall(FILTER);

      expect(result).toEqual(RESULT);
      expect(TransactionModel.aggregate).toHaveBeenCalledOnce();
      expect(TransactionModel.aggregate).toHaveBeenCalledWith([
        { $match: FILTER },
        {
          $group: {
            _id: { transactionType: '$transactionType' },
            totalItems: { $sum: 1 },
          },
        },
        { $sort: { '_id.transactionType': 1 } },
      ]);
    });

    it('find transaction totals by currency', async () => {
      (TransactionModel.aggregate as Mock).mockResolvedValue(RESULT);

      const result = await findTransactionTotalsByCurrency(FILTER);

      expect(result).toEqual(RESULT);
      expect(TransactionModel.aggregate).toHaveBeenCalledOnce();
      expect(TransactionModel.aggregate).toHaveBeenCalledWith([
        { $match: FILTER },
        {
          $group: {
            _id: { currency: '$currency', transactionType: '$transactionType' },
            totalAmount: { $sum: '$amount' },
            totalItems: { $sum: 1 },
            averageAmount: { $avg: '$amount' },
            maxAmount: { $max: '$amount' },
            minAmount: { $min: '$amount' },
          },
        },
        { $sort: { '_id.currency': 1, '_id.transactionType': 1 } },
      ]);
    });
  });

  describe('findTransactionResourceIds', () => {
    it('finds distinct transaction resource ids', async () => {
      const FILTER = {
        ownerId: randomObjectIdString(),
        deletion: null,
      };
      const accountId = randomObjectIdString();
      const categoryId = randomObjectIdString();
      const paymentMethodId = randomObjectIdString();

      (TransactionModel.distinct as Mock)
        .mockResolvedValueOnce([accountId])
        .mockResolvedValueOnce([categoryId])
        .mockResolvedValueOnce([paymentMethodId]);

      const result = await findTransactionResourceIds(FILTER as any);

      expect(result).toEqual({
        accountIds: [accountId],
        categoryIds: [categoryId],
        paymentMethodIds: [paymentMethodId],
      });
      expect(TransactionModel.distinct).toHaveBeenNthCalledWith(1, 'accountId', FILTER);
      expect(TransactionModel.distinct).toHaveBeenNthCalledWith(2, 'categoryId', FILTER);
      expect(TransactionModel.distinct).toHaveBeenNthCalledWith(
        3,
        'paymentMethodId',
        FILTER,
      );
    });
  });

  describe('loadTransactionWithReference', () => {
    const { expenseTransactionNotPopulatedJSON, incomeTransactionNotPopulatedJSON } =
      getExchangeTransactionNotPopulatedResultJSON();

    it('loaded correctly', async () => {
      (TransactionModel.findOne as Mock)
        .mockResolvedValueOnce(expenseTransactionNotPopulatedJSON)
        .mockResolvedValueOnce(incomeTransactionNotPopulatedJSON);

      const { transaction, transactionRef } = await loadTransactionWithReference(
        EXCHANGE_TXN_EXPENSE_ID_STR,
        USER_ID_STR,
        EXCHANGE_CATEGORY_ID_STR,
        EXCHANGE_CATEGORY_NAME,
      );

      expect(TransactionModel.findOne).toHaveBeenCalledTimes(2);
      expect(TransactionModel.findOne).toHaveBeenNthCalledWith(1, {
        _id: EXCHANGE_TXN_EXPENSE_ID_STR,
        deletion: null,
      });
      expect(TransactionModel.findOne).toHaveBeenNthCalledWith(2, {
        _id: EXCHANGE_TXN_INCOME_ID_STR,
        deletion: null,
      });
      expect(transaction).toEqual(expenseTransactionNotPopulatedJSON);
      expect(transactionRef).toEqual(incomeTransactionNotPopulatedJSON);
    });

    it.each([
      [
        'transfer',
        TRANSFER_CATEGORY_ID_STR,
        TRANSFER_CATEGORY_NAME,
        TransactionTransferCategoryError,
      ],
      [
        'exchange',
        EXCHANGE_CATEGORY_ID_STR,
        EXCHANGE_CATEGORY_NAME,
        TransactionExchangeCategoryError,
      ],
    ])(
      "throws if main transaction has wrong category ('%s')",
      async (_, expectedCategoryId, expectedCategoryName, expectedError) => {
        (TransactionModel.findOne as Mock).mockResolvedValueOnce({
          ...expenseTransactionNotPopulatedJSON,
          categoryId: FOOD_CATEGORY_ID_STR,
        });

        await expect(
          loadTransactionWithReference(
            EXCHANGE_TXN_EXPENSE_ID_STR,
            USER_ID_STR,
            expectedCategoryId,
            expectedCategoryName as SystemCategoryName,
          ),
        ).rejects.toThrow(expectedError);
        expect(TransactionModel.findOne).toHaveBeenCalledTimes(1);
      },
    );

    it('throws if main transaction is missing refId', async () => {
      (TransactionModel.findOne as Mock).mockResolvedValueOnce({
        ...expenseTransactionNotPopulatedJSON,
        refId: undefined,
      });

      await expect(
        loadTransactionWithReference(
          EXCHANGE_TXN_EXPENSE_ID_STR,
          USER_ID_STR,
          EXCHANGE_CATEGORY_ID_STR,
          EXCHANGE_CATEGORY_NAME,
        ),
      ).rejects.toThrow(TransactionMissingReferenceError);
      expect(TransactionModel.findOne).toHaveBeenCalledOnce();
    });

    it.each([
      [
        'transfer',
        TRANSFER_TXN_EXPENSE_ID_STR,
        TRANSFER_CATEGORY_ID_STR,
        TRANSFER_CATEGORY_NAME,
        TransactionTransferCategoryError,
      ],
      [
        'exchange',
        EXCHANGE_TXN_EXPENSE_ID_STR,
        EXCHANGE_CATEGORY_ID_STR,
        EXCHANGE_CATEGORY_NAME,
        TransactionExchangeCategoryError,
      ],
    ])(
      "throws if reference transaction has wrong category ('%s')",
      async (_, txnId, expectedCategoryId, expectedCategoryName, expectedError) => {
        (TransactionModel.findOne as Mock)
          .mockResolvedValueOnce({
            ...expenseTransactionNotPopulatedJSON,
            categoryId: expectedCategoryId,
          })
          .mockResolvedValueOnce({
            ...incomeTransactionNotPopulatedJSON,
            categoryId: FOOD_CATEGORY_ID_STR,
          });

        await expect(
          loadTransactionWithReference(
            txnId,
            USER_ID_STR,
            expectedCategoryId,
            expectedCategoryName as SystemCategoryName,
          ),
        ).rejects.toThrow(expectedError);
        expect(TransactionModel.findOne).toHaveBeenCalledTimes(2);
      },
    );

    it('throws if reference transaction is missing refId', async () => {
      (TransactionModel.findOne as Mock)
        .mockResolvedValueOnce(expenseTransactionNotPopulatedJSON)
        .mockResolvedValueOnce({
          ...incomeTransactionNotPopulatedJSON,
          refId: undefined,
        });

      await expect(
        loadTransactionWithReference(
          EXCHANGE_TXN_EXPENSE_ID_STR,
          USER_ID_STR,
          EXCHANGE_CATEGORY_ID_STR,
          EXCHANGE_CATEGORY_NAME,
        ),
      ).rejects.toThrow(TransactionMissingReferenceError);
      expect(TransactionModel.findOne).toHaveBeenCalledTimes(2);
    });

    it("throws if reference transaction's refId is not pointing to main transaction", async () => {
      (TransactionModel.findOne as Mock)
        .mockResolvedValueOnce(expenseTransactionNotPopulatedJSON)
        .mockResolvedValueOnce({
          ...incomeTransactionNotPopulatedJSON,
          refId: EXCHANGE_TXN_INCOME_ID_STR,
        });

      await expect(
        loadTransactionWithReference(
          EXCHANGE_TXN_EXPENSE_ID_STR,
          USER_ID_STR,
          EXCHANGE_CATEGORY_ID_STR,
          EXCHANGE_CATEGORY_NAME,
        ),
      ).rejects.toThrow(TransactionWrongReferenceError);
      expect(TransactionModel.findOne).toHaveBeenCalledTimes(2);
    });

    it('throws if both transactions have the same type', async () => {
      (TransactionModel.findOne as Mock)
        .mockResolvedValueOnce({
          ...expenseTransactionNotPopulatedJSON,
          transactionType: TRANSACTION_TYPE_EXPENSE,
        })
        .mockResolvedValueOnce({
          ...incomeTransactionNotPopulatedJSON,
          transactionType: TRANSACTION_TYPE_EXPENSE,
        });

      await expect(
        loadTransactionWithReference(
          EXCHANGE_TXN_EXPENSE_ID_STR,
          USER_ID_STR,
          EXCHANGE_CATEGORY_ID_STR,
          EXCHANGE_CATEGORY_NAME,
        ),
      ).rejects.toThrow(TransactionWrongTypesError);
      expect(TransactionModel.findOne).toHaveBeenCalledTimes(2);
    });
  });

  describe('streamTransactions', () => {
    const mockResult = 'cursor';
    const mockQuery = {
      find: vi.fn().mockReturnThis(),
      sort: vi.fn().mockReturnThis(),
      cursor: vi.fn().mockReturnValue(mockResult),
    };

    it('stream transactions', () => {
      const FILTER = {
        ownerId: randomObjectIdString(),
        deletion: null,
      };
      (TransactionModel.find as Mock).mockReturnValue(mockQuery);

      const result = streamTransactions(FILTER as any);

      expect(TransactionModel.find).toHaveBeenCalledOnce();
      expect(TransactionModel.find).toHaveBeenCalledWith(FILTER);
      expect(mockQuery.sort).toHaveBeenCalledOnce();
      expect(mockQuery.sort).toHaveBeenCalledWith({ sourceIndex: 1 });
      expect(mockQuery.cursor).toHaveBeenCalledOnce();
      expect(result).toEqual(mockResult);
    });
  });
});
