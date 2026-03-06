import { describe, expect, it } from 'vitest';

import { transactionToCsvRow } from './transaction-to-csv-row';

import {
  FOOD_CATEGORY_ID_STR,
  FOOD_CATEGORY_NAME,
} from '@/test-utils/factories/category';
import { DATE_STR } from '@/test-utils/factories/general';
import {
  BANK_TRANSFER_PAYMENT_METHOD_ID_STR,
  PAYMENT_METHOD_BANK_TRANSFER_NAME,
} from '@/test-utils/factories/payment-method';
import { getStandardTransactionProps } from '@/test-utils/factories/transaction';

describe('transactionToCsvRow', () => {
  const { ownerId, categoryId, paymentMethodId, ...transaction } =
    getStandardTransactionProps();
  const categoriesMap = { [FOOD_CATEGORY_ID_STR]: { name: FOOD_CATEGORY_NAME } };
  const paymentMethodsMap = {
    [BANK_TRANSFER_PAYMENT_METHOD_ID_STR]: { name: PAYMENT_METHOD_BANK_TRANSFER_NAME },
  };

  it('transaction to csv row', () => {
    const result = transactionToCsvRow(
      { ...transaction, categoryId, paymentMethodId } as any,
      categoriesMap as any,
      paymentMethodsMap as any,
    );

    expect(result).toEqual({
      ...transaction,
      category: FOOD_CATEGORY_NAME,
      paymentMethod: PAYMENT_METHOD_BANK_TRANSFER_NAME,
      date: DATE_STR,
      currencies: undefined,
      exchangeRate: undefined,
      sourceRefIndex: undefined,
    });
  });
});
