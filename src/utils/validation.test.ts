import { describe, expect, it } from 'vitest';

import {
  EXCHANGE_CATEGORY_ID_STR,
  FOOD_CATEGORY_ID_STR,
} from '@testing/factories/category';
import {
  BANK_TRANSFER_PAYMENT_METHOD_ID_STR,
  CASH_PAYMENT_METHOD_ID_STR,
} from '@testing/factories/payment-method';
import {
  ACCOUNT_EXPENSE_ID_STR,
  ACCOUNT_INCOME_ID_STR,
  getStandardTransactionDTO,
  getTransferTransactionDTO,
} from '@testing/factories/transaction';
import {
  TransactionFiltersQuerySchema,
  TransactionStandardSchema,
  TransactionStatisticsQuerySchema,
  TransactionTransferSchema,
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
  const zeroAmountBody = {
    ...validBody,
    amount: 0,
  };
  const validTransferBody = {
    ...getTransferTransactionDTO(),
    accountIncomeId: ACCOUNT_EXPENSE_ID_STR,
  };
  const zeroTransferBody = {
    ...validTransferBody,
    amount: 0,
  };
  const validQuery = { transactionType: 'expense', currency: 'PLN' };
  const { date, ...notValidBody } = validBody;
  const notValidQuery = { transactionType: 'expense' };

  it.each([
    ['validateBody', validateBody, 'body', validBody, TransactionStandardSchema],
    ['validateBody', validateBody, 'body', zeroAmountBody, TransactionStandardSchema],
    ['validateBody', validateBody, 'body', validTransferBody, TransactionTransferSchema],
    ['validateBody', validateBody, 'body', zeroTransferBody, TransactionTransferSchema],
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
        categoryIds: `${FOOD_CATEGORY_ID_STR},${EXCHANGE_CATEGORY_ID_STR}`,
        paymentMethodIds: `${BANK_TRANSFER_PAYMENT_METHOD_ID_STR},${CASH_PAYMENT_METHOD_ID_STR}`,
        accountIds: `${ACCOUNT_EXPENSE_ID_STR},${ACCOUNT_INCOME_ID_STR}`,
        excludePaymentMethodIds: CASH_PAYMENT_METHOD_ID_STR,
        excludeAccountIds: ACCOUNT_INCOME_ID_STR,
      },
    };
    const validateFunc = validateQuery(TransactionFiltersQuerySchema);

    await validateFunc(req as any, {} as any);

    expect(req.query).toEqual({
      categoryIds: [FOOD_CATEGORY_ID_STR, EXCHANGE_CATEGORY_ID_STR],
      paymentMethodIds: [BANK_TRANSFER_PAYMENT_METHOD_ID_STR, CASH_PAYMENT_METHOD_ID_STR],
      accountIds: [ACCOUNT_EXPENSE_ID_STR, ACCOUNT_INCOME_ID_STR],
      excludePaymentMethodIds: [CASH_PAYMENT_METHOD_ID_STR],
      excludeAccountIds: [ACCOUNT_INCOME_ID_STR],
    });
  });
});
