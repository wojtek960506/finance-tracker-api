import { describe, expect, it, Mock, vi } from 'vitest';

import * as namedResourceServices from '@named-resource/services';
import { getSystemExpenseAccountResultSerialized } from '@testing/factories/account';
import { USER_ID_STR } from '@testing/factories/general';
import {
  getStandardTransactionNotPopulatedResultJSON,
  getStandardTransactionResultSerialized,
  getTransferTransactionNotPopulatedResultJSON,
  getTransferTransactionResultSerialized,
} from '@testing/factories/transaction';
import { findTransactions, findTransactionsCount } from '@transaction/db';
import { serializeTransaction } from '@transaction/serializers';
import { getTransactions } from '@transaction/services';

vi.mock('@transaction/db', () => ({
  findTransactions: vi.fn(),
  findTransactionsCount: vi.fn(),
}));

vi.mock('@transaction/serializers', () => ({ serializeTransaction: vi.fn() }));

describe('getTransactionsTest', () => {
  it('get transactions', async () => {
    const total = 3;
    const account = getSystemExpenseAccountResultSerialized();
    const tmpAccountsMap = { [account.id]: { name: account.name } } as any;
    const tmpCategoriesMap = { key: 'value' } as any;
    const tmpPaymentMethodsMap = { key2: 'value2' } as any;

    const transactionNotPopulatedJSON = getStandardTransactionNotPopulatedResultJSON();
    const { expenseTransactionNotPopulatedJSON, incomeTransactionNotPopulatedJSON } =
      getTransferTransactionNotPopulatedResultJSON();
    const transactionSerialized = getStandardTransactionResultSerialized();
    const { expenseTransactionSerialized, incomeTransactionSerialized } =
      getTransferTransactionResultSerialized();
    const query = { page: 1, limit: 10, sortBy: 'date', sortOrder: 'desc' } as const;

    (findTransactions as Mock).mockResolvedValue([
      transactionNotPopulatedJSON,
      expenseTransactionNotPopulatedJSON,
      incomeTransactionNotPopulatedJSON,
    ]);
    (findTransactionsCount as Mock).mockResolvedValue(total);
    (serializeTransaction as Mock)
      .mockReturnValueOnce(transactionSerialized)
      .mockReturnValueOnce(expenseTransactionSerialized)
      .mockReturnValueOnce(incomeTransactionSerialized);
    vi.spyOn(namedResourceServices, 'prepareNamedResourcesMap')
      .mockResolvedValueOnce(tmpAccountsMap)
      .mockResolvedValueOnce(tmpCategoriesMap)
      .mockResolvedValueOnce(tmpPaymentMethodsMap);

    const result = await getTransactions(query, USER_ID_STR);

    expect(findTransactions).toHaveBeenCalledOnce();
    expect(findTransactionsCount).toHaveBeenCalledOnce();
    expect(serializeTransaction).toHaveBeenCalledTimes(total);
    expect(serializeTransaction).toHaveBeenNthCalledWith(
      1,
      transactionNotPopulatedJSON,
      tmpCategoriesMap,
      tmpPaymentMethodsMap,
      tmpAccountsMap,
    );
    expect(serializeTransaction).toHaveBeenNthCalledWith(
      2,
      expenseTransactionNotPopulatedJSON,
      tmpCategoriesMap,
      tmpPaymentMethodsMap,
      tmpAccountsMap,
    );
    expect(serializeTransaction).toHaveBeenNthCalledWith(
      3,
      incomeTransactionNotPopulatedJSON,
      tmpCategoriesMap,
      tmpPaymentMethodsMap,
      tmpAccountsMap,
    );
    expect(result).toEqual({
      page: query.page,
      limit: query.limit,
      total: total,
      totalPages: 1,
      items: [
        transactionSerialized,
        expenseTransactionSerialized,
        incomeTransactionSerialized,
      ],
    });
  });
});
