import {
  getSystemExpenseAccountResultSerialized,
  getSystemIncomeAccountResultSerialized,
} from '@testing/factories/account';
import {
  CATEGORY_TYPE_SYSTEM,
  CATEGORY_TYPE_USER,
  FOOD_CATEGORY_ID_STR,
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

import * as dbAccounts from '@account/db';
import * as dbCategories from '@category/db';
import * as serializers from '@category/serializers';
import * as dbPaymentMethods from '@payment-method/db';
import * as dbTransactions from '@transaction/db';
import {
  updateExchangeTransaction,
  updateStandardTransaction,
  updateTransferTransaction,
} from '@transaction/services';
import {
  CategoryNotFoundError,
  PaymentMethodOwnershipError,
  SystemCategoryHasOwner,
  SystemCategoryNotAllowed,
  SystemCategoryWrongType,
} from '@utils/errors';

describe('update transaction', async () => {
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

  it('update standard transaction', async () => {
    vi.spyOn(dbTransactions, 'findTransaction').mockResolvedValue(transaction as any);
    vi.spyOn(dbTransactions, 'saveTransactionChanges').mockResolvedValue(
      transaction as any,
    );
    vi.spyOn(dbCategories, 'findCategoryById').mockResolvedValue(foodCategory as any);
    vi.spyOn(dbPaymentMethods, 'findPaymentMethodById').mockResolvedValue(
      paymentMethod as any,
    );
    vi.spyOn(dbAccounts, 'findAccountById').mockResolvedValue(accountExpense as any);

    const result = await updateStandardTransaction(
      STANDARD_TXN_ID_STR,
      USER_ID_STR,
      standardDTO,
    );

    expect(dbCategories.findCategoryById).toHaveBeenCalledOnce();
    expect(dbCategories.findCategoryById).toHaveBeenCalledWith(FOOD_CATEGORY_ID_STR);
    expect(dbTransactions.findTransaction).toHaveBeenCalledOnce();
    expect(dbTransactions.findTransaction).toHaveBeenCalledWith(STANDARD_TXN_ID_STR);
    expect(dbPaymentMethods.findPaymentMethodById).toHaveBeenCalledOnce();
    expect(dbTransactions.saveTransactionChanges).toHaveBeenCalledOnce();
    expect(dbTransactions.saveTransactionChanges).toHaveBeenCalledWith(
      transaction,
      standardDTO,
    );
    expect(result).toEqual(transaction);
  });

  it.each([
    ['transfer', transferPair, transferDTO, updateTransferTransaction, transferCategory],
    ['exchange', exchangePair, exchangeDTO, updateExchangeTransaction, exchangeCategory],
  ])('udate %s transaction', async (_, expectedResult, dto, updateFunc, category) => {
    vi.spyOn(dbTransactions, 'loadTransactionWithReference').mockResolvedValue(
      expectedResult as any,
    );
    vi.spyOn(dbTransactions, 'saveTransactionPairChanges').mockResolvedValue(
      expectedResult as any,
    );
    vi.spyOn(dbAccounts, 'findAccountById')
      .mockResolvedValueOnce(accountExpense as any)
      .mockResolvedValueOnce(accountIncome as any);
    vi.spyOn(dbPaymentMethods, 'findPaymentMethodById').mockResolvedValue(
      paymentMethod as any,
    );
    vi.spyOn(dbCategories, 'findCategoryByName').mockResolvedValue(category as any);
    vi.spyOn(serializers, 'serializeCategory').mockReturnValue(category as any);

    const result = await updateFunc(TRANSFER_TXN_EXPENSE_ID_STR, USER_ID_STR, dto as any);

    expect(dbCategories.findCategoryByName).toHaveBeenCalledOnce();
    expect(serializers.serializeCategory).toHaveBeenCalledOnce();
    expect(dbTransactions.loadTransactionWithReference).toHaveBeenCalledOnce();
    expect(dbTransactions.saveTransactionPairChanges).toHaveBeenCalledOnce();
    expect(result).toEqual(expectedResult);
  });

  it('throws when updating standard transaction with system category', async () => {
    vi.spyOn(dbCategories, 'findCategoryById').mockResolvedValue({
      ...foodCategory,
      type: CATEGORY_TYPE_SYSTEM,
    } as any);
    vi.spyOn(dbAccounts, 'findAccountById').mockResolvedValue(accountExpense as any);
    vi.spyOn(dbTransactions, 'findTransaction');
    vi.spyOn(dbTransactions, 'saveTransactionChanges');

    await expect(
      updateStandardTransaction(STANDARD_TXN_ID_STR, USER_ID_STR, standardDTO),
    ).rejects.toThrow(SystemCategoryNotAllowed);

    expect(dbCategories.findCategoryById).toHaveBeenCalledOnce();
    expect(dbTransactions.findTransaction).not.toHaveBeenCalled();
    expect(dbTransactions.saveTransactionChanges).not.toHaveBeenCalled();
  });

  // prettier-ignore
  it(
    'should throw error when creating single transaction with payment method not owned by user',
    async () => {
      vi.spyOn(dbCategories, 'findCategoryById').mockResolvedValue( foodCategory as any);
      vi.spyOn(dbPaymentMethods, 'findPaymentMethodById').mockResolvedValue(
        { ...paymentMethod, type: CATEGORY_TYPE_USER, ownerId: '123', id: '1' } as any,
      );
      vi.spyOn(dbAccounts, 'findAccountById').mockResolvedValue(accountExpense as any);
      vi.spyOn(dbTransactions, 'findTransaction');
      vi.spyOn(dbTransactions, 'saveTransactionChanges');

      await expect(
      updateStandardTransaction(STANDARD_TXN_ID_STR, USER_ID_STR, standardDTO),
    ).rejects.toThrow(PaymentMethodOwnershipError);

      expect(dbCategories.findCategoryById).toHaveBeenCalledOnce();
      expect(dbPaymentMethods.findPaymentMethodById).toHaveBeenCalledOnce();
      expect(dbTransactions.findTransaction).not.toHaveBeenCalled();
      expect(dbTransactions.saveTransactionChanges).not.toHaveBeenCalled();
    }
  );

  it('throws when updating transaction pair with not system category', async () => {
    vi.spyOn(dbCategories, 'findCategoryByName').mockResolvedValue(
      exchangeCategory as any,
    );
    vi.spyOn(dbAccounts, 'findAccountById').mockResolvedValue(accountExpense as any);
    vi.spyOn(dbPaymentMethods, 'findPaymentMethodById').mockResolvedValue(
      paymentMethod as any,
    );
    vi.spyOn(serializers, 'serializeCategory').mockReturnValue({
      ...exchangeCategory,
      type: CATEGORY_TYPE_USER,
    } as any);
    vi.spyOn(dbTransactions, 'loadTransactionWithReference');
    vi.spyOn(dbTransactions, 'saveTransactionPairChanges');

    await expect(
      updateExchangeTransaction(EXCHANGE_TXN_EXPENSE_ID_STR, USER_ID_STR, exchangeDTO),
    ).rejects.toThrow(SystemCategoryWrongType);

    expect(dbCategories.findCategoryByName).toHaveBeenCalledOnce();
    expect(serializers.serializeCategory).toHaveBeenCalledOnce();
    expect(dbTransactions.loadTransactionWithReference).not.toHaveBeenCalled();
    expect(dbTransactions.saveTransactionPairChanges).not.toHaveBeenCalled();
  });

  it('throws when updating transaction pair with system category which has owner', async () => {
    vi.spyOn(dbCategories, 'findCategoryByName').mockResolvedValue(
      transferCategory as any,
    );
    vi.spyOn(dbAccounts, 'findAccountById')
      .mockResolvedValueOnce(accountExpense as any)
      .mockResolvedValueOnce(accountIncome as any);
    vi.spyOn(dbPaymentMethods, 'findPaymentMethodById').mockResolvedValue(
      paymentMethod as any,
    );
    vi.spyOn(serializers, 'serializeCategory').mockReturnValue({
      ...transferCategory,
      ownerId: USER_ID_STR,
    } as any);
    vi.spyOn(dbTransactions, 'loadTransactionWithReference');
    vi.spyOn(dbTransactions, 'saveTransactionPairChanges');

    await expect(
      updateTransferTransaction(TRANSFER_TXN_EXPENSE_ID_STR, USER_ID_STR, transferDTO),
    ).rejects.toThrow(SystemCategoryHasOwner);

    expect(dbCategories.findCategoryByName).toHaveBeenCalledOnce();
    expect(serializers.serializeCategory).toHaveBeenCalledOnce();
    expect(dbTransactions.loadTransactionWithReference).not.toHaveBeenCalled();
    expect(dbTransactions.saveTransactionPairChanges).not.toHaveBeenCalled();
  });

  it('throws when updating transaction pair with not existing category', async () => {
    vi.spyOn(dbCategories, 'findCategoryByName').mockResolvedValue(null);
    vi.spyOn(dbAccounts, 'findAccountById')
      .mockResolvedValueOnce(accountExpense as any)
      .mockResolvedValueOnce(accountIncome as any);
    vi.spyOn(dbPaymentMethods, 'findPaymentMethodById').mockResolvedValue(
      paymentMethod as any,
    );
    vi.spyOn(dbTransactions, 'loadTransactionWithReference');
    vi.spyOn(dbTransactions, 'saveTransactionPairChanges');

    await expect(
      updateTransferTransaction(TRANSFER_TXN_EXPENSE_ID_STR, USER_ID_STR, transferDTO),
    ).rejects.toThrow(CategoryNotFoundError);

    expect(dbCategories.findCategoryByName).toHaveBeenCalledOnce();
    expect(serializers.serializeCategory).not.toHaveBeenCalled();
    expect(dbTransactions.loadTransactionWithReference).not.toHaveBeenCalled();
    expect(dbTransactions.saveTransactionPairChanges).not.toHaveBeenCalled();
  });
});
