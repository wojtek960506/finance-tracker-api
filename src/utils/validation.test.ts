import { describe, expect, it } from 'vitest';

import {
  EXCHANGE_CATEGORY_ID_STR,
  FOOD_CATEGORY_ID_STR,
} from '@testing/factories/category';
import { ACCOUNT_EXPENSE_ID_STR, ACCOUNT_INCOME_ID_STR } from '@testing/factories/transaction';
import {
  BANK_TRANSFER_PAYMENT_METHOD_ID_STR,
  CASH_PAYMENT_METHOD_ID_STR,
} from '@testing/factories/payment-method';
import { getStandardTransactionDTO } from '@testing/factories/transaction';
import {
  TransactionFiltersQuerySchema,
  TransactionStandardSchema,
  TransactionStatisticsQuerySchema,
} from '@transaction/schema';

import { ValidationError } from './errors';
import { validateBody, validateQuery } from './validation';

const expectValidationError = async (promise: Promise<unknown>) => {
  await expect(promise).rejects.toBeInstanceOf(ValidationError);
  await expect(promise).rejects.toMatchObject({
    statusCode: 422,
    details: expect.anything(),
  });
};

describe('validation', () => {
  const validBody = getStandardTransactionDTO();
  const validQuery = { transactionType: 'expense', currency: 'PLN' };
  const { date, ...notValidBody } = validBody;
  const notValidQuery = { transactionType: 'expense' };

  it.each([
    ['validateBody', validateBody, 'body', validBody, TransactionStandardSchema],
    [
      'validateQuery',
      validateQuery,
      'query',
      validQuery,
      TransactionStatisticsQuerySchema,
    ],
  ])(
    '%s - when data is proper then no errors',
    async (_funcName, func, reqKey, reqValue, schema) => {
      const req = { [reqKey as 'body' | 'query']: reqValue };
      const validateFunc = func(schema);

      await validateFunc(req as any, {} as any);

      expect(req[reqKey]).toEqual(reqValue);
    },
  );

  it.each([
    ['validateBody', validateBody, 'body', notValidBody, TransactionStandardSchema],
    [
      'validateQuery',
      validateQuery,
      'query',
      notValidQuery,
      TransactionStatisticsQuerySchema,
    ],
  ])(
    '%s - when data is not proper then error is thrown',
    async (_funcName, func, reqKey, reqValue, schema) => {
      const req = { [reqKey]: reqValue };
      const validateFunc = func(schema);

      expectValidationError(validateFunc(req as any, {} as any));
    },
  );

  it('validate not correct `excludeCategoryIds` in TransactionFiltersQuerySchema', async () => {
    const req = { query: { excludeCategoryIds: 'not-object-id-1,not-object-id-2' } };
    const validateFunc = validateQuery(TransactionFiltersQuerySchema);

    expectValidationError(validateFunc(req as any, {} as any));
  });

  it('parses multi-value transaction filters in TransactionFiltersQuerySchema', async () => {
    const req = {
      query: {
        categoryId: `${FOOD_CATEGORY_ID_STR},${EXCHANGE_CATEGORY_ID_STR}`,
        paymentMethodId: `${BANK_TRANSFER_PAYMENT_METHOD_ID_STR},${CASH_PAYMENT_METHOD_ID_STR}`,
        accountId: `${ACCOUNT_EXPENSE_ID_STR},${ACCOUNT_INCOME_ID_STR}`,
        excludePaymentMethodIds: CASH_PAYMENT_METHOD_ID_STR,
        excludeAccountIds: ACCOUNT_INCOME_ID_STR,
      },
    };
    const validateFunc = validateQuery(TransactionFiltersQuerySchema);

    await validateFunc(req as any, {} as any);

    expect(req.query).toEqual({
      categoryId: [FOOD_CATEGORY_ID_STR, EXCHANGE_CATEGORY_ID_STR],
      paymentMethodId: [BANK_TRANSFER_PAYMENT_METHOD_ID_STR, CASH_PAYMENT_METHOD_ID_STR],
      accountId: [ACCOUNT_EXPENSE_ID_STR, ACCOUNT_INCOME_ID_STR],
      excludePaymentMethodIds: [CASH_PAYMENT_METHOD_ID_STR],
      excludeAccountIds: [ACCOUNT_INCOME_ID_STR],
    });
  });
});
