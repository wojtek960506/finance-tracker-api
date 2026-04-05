import {
  ACCOUNT_TYPE_USER,
  getSystemExpenseAccountResultSerialized,
  getSystemIncomeAccountResultSerialized,
} from '@testing/factories/account';
import {
  CATEGORY_TYPE_SYSTEM,
  CATEGORY_TYPE_USER,
  getExchangeCategoryResultJSON,
  getTransferCategoryResultJSON,
  getUserCategoryResultSerialized,
} from '@testing/factories/category';
import { USER_ID_STR } from '@testing/factories/general';
import { getBankTransferPaymentMethodResultJSON } from '@testing/factories/payment-method';
import {
  EXCHANGE_TXN_EXPENSE_ID_STR,
  getExchangeTransactionDTO,
  getExchangeTransactionResultJSON,
  getStandardTransactionDTO,
  getStandardTransactionNotPopulatedResultJSON,
  getTransferTransactionDTO,
  getTransferTransactionResultJSON,
  STANDARD_TXN_ID_STR,
  TRANSFER_TXN_EXPENSE_ID_STR,
} from '@testing/factories/transaction';
import { afterEach, describe, expect, it, vi } from 'vitest';

import * as namedResourceDb from '@shared/named-resource/db';
import * as dbTransactions from '@transaction/db';
import {
  updateExchangeTransaction,
  updateStandardTransaction,
  updateTransferTransaction,
} from '@transaction/services';
import {
  AccountOwnershipError,
  PaymentMethodOwnershipError,
  SystemCategoryNotAllowed,
  SystemCategoryWrongType,
} from '@utils/errors';

describe('update transaction', () => {
  const standardDTO = getStandardTransactionDTO();
  const exchangeDTO = getExchangeTransactionDTO();
  const transferDTO = getTransferTransactionDTO();

  const transaction = getStandardTransactionNotPopulatedResultJSON();
  const transferPair = getTransferTransactionResultJSON();
  const exchangePair = getExchangeTransactionResultJSON();

  const foodCategory = getUserCategoryResultSerialized();
  const transferCategory = getTransferCategoryResultJSON();
  const exchangeCategory = getExchangeCategoryResultJSON();
  const paymentMethod = getBankTransferPaymentMethodResultJSON();
  const accountExpense = getSystemExpenseAccountResultSerialized();
  const accountIncome = getSystemIncomeAccountResultSerialized();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('updates standard transaction', async () => {
    vi.spyOn(namedResourceDb, 'findNamedResourceById')
      .mockResolvedValueOnce(foodCategory as any)
      .mockResolvedValueOnce(paymentMethod as any)
      .mockResolvedValueOnce(accountExpense as any);
    vi.spyOn(dbTransactions, 'findTransaction').mockResolvedValue(transaction as any);
    vi.spyOn(dbTransactions, 'saveTransactionChanges').mockResolvedValue(
      transaction as any,
    );

    const result = await updateStandardTransaction(
      STANDARD_TXN_ID_STR,
      USER_ID_STR,
      standardDTO,
    );

    expect(dbTransactions.saveTransactionChanges).toHaveBeenCalledWith(
      transaction,
      standardDTO,
    );
    expect(result).toEqual(transaction);
  });

  it('updates transfer transaction pair', async () => {
    vi.spyOn(namedResourceDb, 'findNamedResourceById')
      .mockResolvedValueOnce(accountExpense as any)
      .mockResolvedValueOnce(accountIncome as any)
      .mockResolvedValueOnce(paymentMethod as any);
    vi.spyOn(namedResourceDb, 'findNamedResourceByName').mockResolvedValue(
      transferCategory as any,
    );
    vi.spyOn(dbTransactions, 'loadTransactionWithReference').mockResolvedValue(
      transferPair as any,
    );
    vi.spyOn(dbTransactions, 'saveTransactionPairChanges').mockResolvedValue(
      transferPair as any,
    );

    const result = await updateTransferTransaction(
      TRANSFER_TXN_EXPENSE_ID_STR,
      USER_ID_STR,
      transferDTO,
    );

    expect(result).toEqual(transferPair);
  });

  it('updates exchange transaction pair', async () => {
    vi.spyOn(namedResourceDb, 'findNamedResourceById')
      .mockResolvedValueOnce(accountExpense as any)
      .mockResolvedValueOnce(paymentMethod as any);
    vi.spyOn(namedResourceDb, 'findNamedResourceByName').mockResolvedValue(
      exchangeCategory as any,
    );
    vi.spyOn(dbTransactions, 'loadTransactionWithReference').mockResolvedValue(
      exchangePair as any,
    );
    vi.spyOn(dbTransactions, 'saveTransactionPairChanges').mockResolvedValue(
      exchangePair as any,
    );

    const result = await updateExchangeTransaction(
      EXCHANGE_TXN_EXPENSE_ID_STR,
      USER_ID_STR,
      exchangeDTO,
    );

    expect(result).toEqual(exchangePair);
  });

  it('throws when updating standard transaction with system category', async () => {
    vi.spyOn(namedResourceDb, 'findNamedResourceById').mockResolvedValueOnce({
      ...foodCategory,
      type: CATEGORY_TYPE_SYSTEM,
    } as any);

    await expect(
      updateStandardTransaction(STANDARD_TXN_ID_STR, USER_ID_STR, standardDTO),
    ).rejects.toThrow(SystemCategoryNotAllowed);
  });

  it('throws when updating standard transaction with account not owned by user', async () => {
    vi.spyOn(namedResourceDb, 'findNamedResourceById')
      .mockResolvedValueOnce(foodCategory as any)
      .mockResolvedValueOnce(paymentMethod as any)
      .mockResolvedValueOnce({
        ...accountExpense,
        type: ACCOUNT_TYPE_USER,
        ownerId: '123',
        id: '1',
      } as any);

    await expect(
      updateStandardTransaction(STANDARD_TXN_ID_STR, USER_ID_STR, standardDTO),
    ).rejects.toThrow(AccountOwnershipError);
  });

  // prettier-ignore
  it(
    'throws when updating standard transaction with payment method not owned by user',
    async () => {
      vi.spyOn(namedResourceDb, 'findNamedResourceById')
        .mockResolvedValueOnce(foodCategory as any)
        .mockResolvedValueOnce({
          ...paymentMethod,
          type: CATEGORY_TYPE_USER,
          ownerId: '123',
          id: '1',
        } as any);

      await expect(
        updateStandardTransaction(STANDARD_TXN_ID_STR, USER_ID_STR, standardDTO),
      ).rejects.toThrow(PaymentMethodOwnershipError);
    }
  );

  it('throws when updating pair transaction with non-system category', async () => {
    vi.spyOn(namedResourceDb, 'findNamedResourceById')
      .mockResolvedValueOnce(accountExpense as any)
      .mockResolvedValueOnce(paymentMethod as any);
    vi.spyOn(namedResourceDb, 'findNamedResourceByName').mockResolvedValue({
      ...exchangeCategory,
      type: CATEGORY_TYPE_USER,
    } as any);

    await expect(
      updateExchangeTransaction(EXCHANGE_TXN_EXPENSE_ID_STR, USER_ID_STR, exchangeDTO),
    ).rejects.toThrow(SystemCategoryWrongType);
  });
});
