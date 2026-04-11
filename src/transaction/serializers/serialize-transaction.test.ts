import { describe, expect, it } from 'vitest';

import { NamedResourceType } from '@named-resource';
import {
  CATEGORY_TYPE_USER,
  FOOD_CATEGORY_ID_STR,
  FOOD_CATEGORY_NAME,
} from '@testing/factories/category';
import {
  BANK_TRANSFER_PAYMENT_METHOD_ID_STR,
  PAYMENT_METHOD_BANK_TRANSFER_NAME,
  PAYMENT_METHOD_TYPE_SYSTEM,
} from '@testing/factories/payment-method';
import {
  getStandardTransactionNotPopulatedResultJSON,
  getStandardTransactionResultJSON,
  getStandardTransactionResultSerialized,
} from '@testing/factories/transaction';
import {
  ACCOUNT_EXPENSE_ID_STR,
  ACCOUNT_EXPENSE_NAME,
} from '@testing/factories/transaction/transaction-consts';
import {
  serializeTransaction,
  serializeTrashedTransaction,
} from '@transaction/serializers';

describe('serializeTransaction', () => {
  const transaction = getStandardTransactionResultJSON();
  const iTransaction = {
    ...transaction,
    toObject: () => ({ ...transaction, __v: 1 }),
  };
  const transactionSerialized = getStandardTransactionResultSerialized();

  const transactionNotPopulated = getStandardTransactionNotPopulatedResultJSON();
  const iTransactionNotPopulated = {
    ...transactionNotPopulated,
    toObject: () => ({ ...transactionNotPopulated, __v: 2 }),
  };
  const categoriesMap = {
    [FOOD_CATEGORY_ID_STR]: {
      id: FOOD_CATEGORY_ID_STR,
      type: CATEGORY_TYPE_USER as NamedResourceType,
      name: FOOD_CATEGORY_NAME,
    },
  };
  const paymentMethodsMap = {
    [BANK_TRANSFER_PAYMENT_METHOD_ID_STR]: {
      id: BANK_TRANSFER_PAYMENT_METHOD_ID_STR,
      type: PAYMENT_METHOD_TYPE_SYSTEM as NamedResourceType,
      name: PAYMENT_METHOD_BANK_TRANSFER_NAME,
    },
  };
  const accountsMap = {
    [ACCOUNT_EXPENSE_ID_STR]: {
      id: ACCOUNT_EXPENSE_ID_STR,
      type: PAYMENT_METHOD_TYPE_SYSTEM as NamedResourceType,
      name: ACCOUNT_EXPENSE_NAME,
    },
  };

  it('serialize transaction with populated category', () => {
    const result = serializeTransaction(iTransaction as any);
    expect(result).toEqual(transactionSerialized);
  });

  it('serialize transaction without populated category', () => {
    const result = serializeTransaction(
      iTransactionNotPopulated as any,
      categoriesMap,
      paymentMethodsMap,
      accountsMap,
    );
    expect(result).toEqual(transactionSerialized);
  });

  it('serialize trashed transaction with deletion details', () => {
    const trashedTransaction = {
      ...transaction,
      deletion: {
        deletedAt: new Date('2026-01-01'),
        purgeAt: new Date('2026-02-01'),
      },
    };
    const iTrashedTransaction = {
      ...trashedTransaction,
      toObject: () => ({ ...trashedTransaction, __v: 3 }),
    };

    const result = serializeTrashedTransaction(iTrashedTransaction as any);

    expect(result).toEqual({
      ...transactionSerialized,
      deletion: trashedTransaction.deletion,
    });
  });
});
