import { describe, expect, it, Mock, vi } from 'vitest';

import { prepareNamedResourcesMap } from '@named-resource/services';
import { ACCOUNT_EXPENSE_ID_STR, ACCOUNT_EXPENSE_NAME } from '@testing/factories/account';
import { OTHER_ACCOUNT_ID_STR, OTHER_ACCOUNT_NAME } from '@testing/factories/account/account-consts';
import { USER_ID_STR } from '@testing/factories/general';
import { TransactionModel } from '@transaction/model';
import { TransactionAccountStatisticsQuery } from '@transaction/schema';
import { buildTransactionFilterQuery } from '@transaction/services/build-transaction-query';

import { getAccountStatistics } from './get-account-statistics';

vi.mock('@named-resource/services', () => ({
  prepareNamedResourcesMap: vi.fn(),
}));

vi.mock('@transaction/model', () => ({
  TransactionModel: { aggregate: vi.fn() },
}));

vi.mock('@transaction/services/build-transaction-query', () => ({
  buildTransactionFilterQuery: vi.fn(),
}));

describe('getAccountStatistics', () => {
  it('gets account statistics grouped by currency and sorted by balance within currency', async () => {
    const FILTER = { ownerId: 'owner', deletion: null };
    const query: TransactionAccountStatisticsQuery = {
      transactionType: 'income',
      currency: 'PLN',
    };

    (buildTransactionFilterQuery as Mock).mockReturnValue(FILTER);
    (TransactionModel.aggregate as Mock).mockResolvedValue([
      {
        _id: { accountId: ACCOUNT_EXPENSE_ID_STR, currency: 'USD' },
        totalAmount: 50,
        totalItems: 1,
      },
      {
        _id: { accountId: OTHER_ACCOUNT_ID_STR, currency: 'PLN' },
        totalAmount: 300,
        totalItems: 4,
      },
      {
        _id: { accountId: ACCOUNT_EXPENSE_ID_STR, currency: 'PLN' },
        totalAmount: 200,
        totalItems: 2,
      },
      {
        _id: { accountId: ACCOUNT_EXPENSE_ID_STR, currency: 'CZK' },
        totalAmount: 1.545430450278218e-13,
        totalItems: 273,
      },
    ]);
    (prepareNamedResourcesMap as Mock).mockResolvedValue({
      [ACCOUNT_EXPENSE_ID_STR]: { name: ACCOUNT_EXPENSE_NAME },
      [OTHER_ACCOUNT_ID_STR]: { name: OTHER_ACCOUNT_NAME },
    });

    const result = await getAccountStatistics(query, USER_ID_STR);

    expect(buildTransactionFilterQuery).toHaveBeenCalledOnce();
    expect(buildTransactionFilterQuery).toHaveBeenCalledWith(query, USER_ID_STR);
    expect(TransactionModel.aggregate).toHaveBeenCalledOnce();
    expect(TransactionModel.aggregate).toHaveBeenCalledWith([
      { $match: FILTER },
      {
        $group: {
          _id: {
            accountId: '$accountId',
            currency: '$currency',
          },
          totalAmount: {
            $sum: {
              $cond: [
                { $eq: ['$transactionType', 'income'] },
                '$amount',
                { $multiply: ['$amount', -1] },
              ],
            },
          },
          totalItems: { $sum: 1 },
        },
      },
      {
        $sort: {
          '_id.currency': 1,
          totalAmount: -1,
          '_id.accountId': 1,
        },
      },
    ]);
    expect(prepareNamedResourcesMap).toHaveBeenCalledOnce();
    expect(prepareNamedResourcesMap).toHaveBeenCalledWith('account', USER_ID_STR, [
      ACCOUNT_EXPENSE_ID_STR,
      OTHER_ACCOUNT_ID_STR,
    ]);
    expect(result).toEqual({
      currencies: [
        {
          currency: 'CZK',
          accounts: [
            {
              accountId: ACCOUNT_EXPENSE_ID_STR,
              accountName: ACCOUNT_EXPENSE_NAME,
              totalAmount: 0,
              totalItems: 273,
            },
          ],
        },
        {
          currency: 'PLN',
          accounts: [
            {
              accountId: OTHER_ACCOUNT_ID_STR,
              accountName: OTHER_ACCOUNT_NAME,
              totalAmount: 300,
              totalItems: 4,
            },
            {
              accountId: ACCOUNT_EXPENSE_ID_STR,
              accountName: ACCOUNT_EXPENSE_NAME,
              totalAmount: 200,
              totalItems: 2,
            },
          ],
        },
        {
          currency: 'USD',
          accounts: [
            {
              accountId: ACCOUNT_EXPENSE_ID_STR,
              accountName: ACCOUNT_EXPENSE_NAME,
              totalAmount: 50,
              totalItems: 1,
            },
          ],
        },
      ],
    });
  });
});
