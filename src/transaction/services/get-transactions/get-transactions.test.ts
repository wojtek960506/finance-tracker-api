import { describe, expect, it, Mock, vi } from 'vitest';

import * as services from '@category/services';
import * as paymentMethodServices from '@payment-method/services';
import { findTransactions, findTransactionsCount } from '@transaction/db';
import { serializeTransaction } from '@transaction/serializers';
import { getTransactions } from '@transaction/services';

import { USER_ID_STR } from '@/test-utils/factories/general';
import {
  getStandardTransactionNotPopulatedResultJSON,
  getStandardTransactionResultSerialized,
  getTransferTransactionNotPopulatedResultJSON,
  getTransferTransactionResultSerialized,
} from '@/test-utils/factories/transaction';

vi.mock('@transaction/db', () => ({
  findTransactions: vi.fn(),
  findTransactionsCount: vi.fn(),
}));

vi.mock('@transaction/serializers', () => ({ serializeTransaction: vi.fn() }));

describe('getTransactionsTest', () => {
  it('get transactions', async () => {
    const total = 3;
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
    vi.spyOn(services, 'prepareCategoriesMap').mockResolvedValue(tmpCategoriesMap);
    vi.spyOn(paymentMethodServices, 'preparePaymentMethodsMap').mockResolvedValue(
      tmpPaymentMethodsMap,
    );

    const result = await getTransactions(query, USER_ID_STR);

    expect(findTransactions).toHaveBeenCalledOnce();
    expect(findTransactionsCount).toHaveBeenCalledOnce();
    expect(serializeTransaction).toHaveBeenCalledTimes(total);
    expect(serializeTransaction).toHaveBeenNthCalledWith(
      1,
      transactionNotPopulatedJSON,
      tmpCategoriesMap,
      tmpPaymentMethodsMap,
    );
    expect(serializeTransaction).toHaveBeenNthCalledWith(
      2,
      expenseTransactionNotPopulatedJSON,
      tmpCategoriesMap,
      tmpPaymentMethodsMap,
    );
    expect(serializeTransaction).toHaveBeenNthCalledWith(
      3,
      incomeTransactionNotPopulatedJSON,
      tmpCategoriesMap,
      tmpPaymentMethodsMap,
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
