import { describe, expect, it } from 'vitest';

import { getSystemExpenseAccountResultSerialized } from '@testing/factories/account';
import { FOOD_CATEGORY_ID_STR, FOOD_CATEGORY_NAME } from '@testing/factories/category';
import { DATE_STR } from '@testing/factories/general';
import {
  BANK_TRANSFER_PAYMENT_METHOD_ID_STR,
  PAYMENT_METHOD_BANK_TRANSFER_NAME,
} from '@testing/factories/payment-method';
import { getStandardTransactionProps } from '@testing/factories/transaction';

import { transactionToCsvRow } from './transaction-to-csv-row';

describe('transactionToCsvRow', () => {
  const { ownerId, categoryId, paymentMethodId, accountId, ...transaction } =
    getStandardTransactionProps();
  const categoriesMap = { [FOOD_CATEGORY_ID_STR]: { name: FOOD_CATEGORY_NAME } };
  const paymentMethodsMap = {
    [BANK_TRANSFER_PAYMENT_METHOD_ID_STR]: { name: PAYMENT_METHOD_BANK_TRANSFER_NAME },
  };
  const account = getSystemExpenseAccountResultSerialized();
  const accountsMap = {
    [accountId]: { name: account.name },
  };

  it('transaction to csv row', () => {
    const result = transactionToCsvRow(
      { ...transaction, categoryId, paymentMethodId, accountId } as any,
      categoriesMap as any,
      paymentMethodsMap as any,
      accountsMap as any,
    );

    expect(result).toEqual({
      ...transaction,
      category: FOOD_CATEGORY_NAME,
      paymentMethod: PAYMENT_METHOD_BANK_TRANSFER_NAME,
      account: account.name,
      date: DATE_STR,
      currencies: undefined,
      exchangeRate: undefined,
      sourceRefIndex: undefined,
    });
  });
});
