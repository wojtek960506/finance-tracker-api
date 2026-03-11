import {
  getSystemExpenseAccountResultSerialized,
  getSystemIncomeAccountResultSerialized,
} from '@testing/factories/account';
import {
  CATEGORY_TYPE_SYSTEM,
  CATEGORY_TYPE_USER,
  EXCHANGE_CATEGORY_NAME,
  FOOD_CATEGORY_ID_STR,
  getExchangeCategoryResultJSON,
  getTransferCategoryResultJSON,
  getUserCategoryResultSerialized,
  TRANSFER_CATEGORY_NAME,
} from '@testing/factories/category';
import { USER_ID_STR } from '@testing/factories/general';
import { getBankTransferPaymentMethodResultJSON } from '@testing/factories/payment-method';
import {
  EXCHANGE_TXN_EXPENSE_SRC_IDX,
  EXCHANGE_TXN_INCOME_SRC_IDX,
  getExchangeTransactionDTO,
  getExchangeTransactionResultSerialized,
  getStandardTransactionDTO,
  getStandardTransactionResultSerialized,
  getTransferTransactionDTO,
  getTransferTransactionResultSerialized,
  STANDARD_TXN_SRC_IDX,
  TRANSFER_TXN_EXPENSE_SRC_IDX,
  TRANSFER_TXN_INCOME_SRC_IDX,
} from '@testing/factories/transaction';
import { afterEach, describe, expect, it, Mock, vi } from 'vitest';

import * as dbAccounts from '@account/db';
import * as dbCategories from '@category/db';
import * as serializers from '@category/serializers';
import * as dbPaymentMethods from '@payment-method/db';
import * as dbTransactions from '@transaction/db';
import { getNextSourceIndex } from '@transaction/services';
import {
  CategoryNotFoundError,
  PaymentMethodOwnershipError,
  SystemCategoryHasOwner,
  SystemCategoryNotAllowed,
  SystemCategoryWrongType,
} from '@utils/errors';

import {
  createExchangeTransaction,
  createStandardTransaction,
  createTransferTransaction,
} from './create-transaction';

vi.mock('@transaction/services/get-next-source-index', () => ({
  getNextSourceIndex: vi.fn(),
}));

describe('createStandardTransaction', async () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const foodCategory = getUserCategoryResultSerialized();
  const exchangeCategory = getExchangeCategoryResultJSON();
  const transferCategory = getTransferCategoryResultJSON();
  const standardDTO = getStandardTransactionDTO();
  const exchangeDTO = getExchangeTransactionDTO();
  const transferDTO = getTransferTransactionDTO();
  const paymentMethod = getBankTransferPaymentMethodResultJSON();
  const accountExpense = getSystemExpenseAccountResultSerialized();
  const accountIncome = getSystemIncomeAccountResultSerialized();

  it('should create standard transaction', async () => {
    const transaction = getStandardTransactionResultSerialized();

    vi.spyOn(dbTransactions, 'persistTransaction').mockResolvedValue(transaction as any);
    (getNextSourceIndex as Mock).mockResolvedValue(STANDARD_TXN_SRC_IDX);
    vi.spyOn(dbCategories, 'findCategoryById').mockResolvedValue(foodCategory as any);
    vi.spyOn(dbPaymentMethods, 'findPaymentMethodById').mockResolvedValue(
      paymentMethod as any,
    );
    vi.spyOn(dbAccounts, 'findAccountById').mockResolvedValue(accountExpense as any);

    const result = await createStandardTransaction(standardDTO, USER_ID_STR);

    expect(dbCategories.findCategoryById).toHaveBeenCalledOnce();
    expect(dbCategories.findCategoryById).toHaveBeenCalledWith(FOOD_CATEGORY_ID_STR);
    expect(dbTransactions.persistTransaction).toHaveBeenCalledOnce();
    expect(dbPaymentMethods.findPaymentMethodById).toHaveBeenCalledOnce();
    expect(dbAccounts.findAccountById).toHaveBeenCalledOnce();
    expect(dbAccounts.findAccountById).toHaveBeenCalledWith(standardDTO.accountId);
    expect(getNextSourceIndex).toHaveBeenCalledOnce();
    expect(getNextSourceIndex).toHaveBeenCalledWith(USER_ID_STR);
    expect(result).toEqual(transaction);
  });

  it('should create exchange transaction', async () => {
    const transactionPair = getExchangeTransactionResultSerialized();

    vi.spyOn(dbTransactions, 'persistTransactionPair').mockResolvedValue(
      transactionPair as any,
    );
    (getNextSourceIndex as Mock)
      .mockResolvedValueOnce(EXCHANGE_TXN_EXPENSE_SRC_IDX)
      .mockResolvedValueOnce(EXCHANGE_TXN_INCOME_SRC_IDX);
    vi.spyOn(dbAccounts, 'findAccountById').mockResolvedValue(accountExpense as any);
    vi.spyOn(dbPaymentMethods, 'findPaymentMethodById').mockResolvedValue(
      paymentMethod as any,
    );
    vi.spyOn(dbCategories, 'findCategoryByName').mockResolvedValue(
      exchangeCategory as any,
    );
    vi.spyOn(serializers, 'serializeCategory').mockReturnValue(exchangeCategory as any);

    const result = await createExchangeTransaction(exchangeDTO, USER_ID_STR);

    expect(dbCategories.findCategoryByName).toHaveBeenCalledOnce();
    expect(dbCategories.findCategoryByName).toHaveBeenCalledWith(EXCHANGE_CATEGORY_NAME);
    expect(serializers.serializeCategory).toHaveBeenCalledOnce();
    expect(serializers.serializeCategory).toHaveBeenCalledWith(exchangeCategory);
    expect(dbTransactions.persistTransactionPair).toHaveBeenCalledOnce();
    expect(dbAccounts.findAccountById).toHaveBeenCalledOnce();
    expect(dbAccounts.findAccountById).toHaveBeenCalledWith(exchangeDTO.accountId);
    expect(dbPaymentMethods.findPaymentMethodById).toHaveBeenCalledOnce();
    expect(getNextSourceIndex).toHaveBeenCalledTimes(2);
    expect(getNextSourceIndex).toHaveBeenNthCalledWith(1, USER_ID_STR);
    expect(getNextSourceIndex).toHaveBeenNthCalledWith(2, USER_ID_STR);
    expect(result).toEqual(transactionPair);
  });

  it('should create transfer transaction', async () => {
    const transactionPair = getTransferTransactionResultSerialized();

    vi.spyOn(dbTransactions, 'persistTransactionPair').mockResolvedValue(
      transactionPair as any,
    );
    (getNextSourceIndex as Mock)
      .mockResolvedValueOnce(TRANSFER_TXN_EXPENSE_SRC_IDX)
      .mockResolvedValueOnce(TRANSFER_TXN_INCOME_SRC_IDX);
    vi.spyOn(dbAccounts, 'findAccountById')
      .mockResolvedValueOnce(accountExpense as any)
      .mockResolvedValueOnce(accountIncome as any);
    vi.spyOn(dbPaymentMethods, 'findPaymentMethodById').mockResolvedValue(
      paymentMethod as any,
    );
    vi.spyOn(dbCategories, 'findCategoryByName').mockResolvedValue(
      transferCategory as any,
    );
    vi.spyOn(serializers, 'serializeCategory').mockReturnValue(transferCategory as any);

    const result = await createTransferTransaction(transferDTO, USER_ID_STR);

    expect(dbCategories.findCategoryByName).toHaveBeenCalledOnce();
    expect(dbCategories.findCategoryByName).toHaveBeenCalledWith(TRANSFER_CATEGORY_NAME);
    expect(serializers.serializeCategory).toHaveBeenCalledOnce();
    expect(serializers.serializeCategory).toHaveBeenCalledWith(transferCategory);
    expect(dbTransactions.persistTransactionPair).toHaveBeenCalledOnce();
    expect(dbAccounts.findAccountById).toHaveBeenCalledTimes(2);
    expect(dbAccounts.findAccountById).toHaveBeenNthCalledWith(
      1,
      transferDTO.accountExpenseId,
    );
    expect(dbAccounts.findAccountById).toHaveBeenNthCalledWith(
      2,
      transferDTO.accountIncomeId,
    );
    expect(dbPaymentMethods.findPaymentMethodById).toHaveBeenCalledOnce();
    expect(getNextSourceIndex).toHaveBeenCalledTimes(2);
    expect(getNextSourceIndex).toHaveBeenNthCalledWith(1, USER_ID_STR);
    expect(getNextSourceIndex).toHaveBeenNthCalledWith(2, USER_ID_STR);
    expect(result).toEqual(transactionPair);
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
      vi.spyOn(dbTransactions, 'persistTransaction');

      await expect(createStandardTransaction(standardDTO, USER_ID_STR)).rejects.toThrow(
        PaymentMethodOwnershipError
      );

      expect(dbCategories.findCategoryById).toHaveBeenCalledOnce();
      expect(dbPaymentMethods.findPaymentMethodById).toHaveBeenCalledOnce();
      expect(dbTransactions.persistTransaction).not.toHaveBeenCalled();
      expect(getNextSourceIndex).not.toHaveBeenCalled();
    }
  );

  it('should throw error when creating single transaction with system category', async () => {
    vi.spyOn(dbCategories, 'findCategoryById').mockResolvedValue({
      ...foodCategory,
      type: CATEGORY_TYPE_SYSTEM,
    } as any);
    vi.spyOn(dbAccounts, 'findAccountById').mockResolvedValue(accountExpense as any);
    vi.spyOn(dbTransactions, 'persistTransaction');

    await expect(createStandardTransaction(standardDTO, USER_ID_STR)).rejects.toThrow(
      SystemCategoryNotAllowed,
    );

    expect(dbCategories.findCategoryById).toHaveBeenCalledOnce();
    expect(dbTransactions.persistTransaction).not.toHaveBeenCalled();
    expect(getNextSourceIndex).not.toHaveBeenCalled();
  });

  it('should throw error when creating transaction pair with user category', async () => {
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
    vi.spyOn(dbTransactions, 'persistTransactionPair');

    await expect(createExchangeTransaction(exchangeDTO, USER_ID_STR)).rejects.toThrow(
      SystemCategoryWrongType,
    );

    expect(dbCategories.findCategoryByName).toHaveBeenCalledOnce();
    expect(serializers.serializeCategory).toHaveBeenCalledOnce();
    expect(dbTransactions.persistTransactionPair).not.toHaveBeenCalled();
    expect(getNextSourceIndex).not.toHaveBeenCalled();
  });

  // prettier-ignore
  it(
    'should throw error when creating transaction pair with system category with owner',
    async () => {
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
      vi.spyOn(dbTransactions, 'persistTransactionPair');

      await expect(createTransferTransaction(transferDTO, USER_ID_STR)).rejects.toThrow(
        SystemCategoryHasOwner,
      );

      expect(dbCategories.findCategoryByName).toHaveBeenCalledOnce();
      expect(serializers.serializeCategory).toHaveBeenCalledOnce();
      expect(dbTransactions.persistTransactionPair).not.toHaveBeenCalled();
      expect(getNextSourceIndex).not.toHaveBeenCalled();
    }
  );

  // prettier-ignore
  it(
    'should throw error when category not found by name for creating transaction pair',
    async () => {
      vi.spyOn(dbCategories, 'findCategoryByName').mockResolvedValue(null);
      vi.spyOn(dbAccounts, 'findAccountById')
        .mockResolvedValueOnce(accountExpense as any)
        .mockResolvedValueOnce(accountIncome as any);
      vi.spyOn(dbPaymentMethods, 'findPaymentMethodById').mockResolvedValue(
        paymentMethod as any,
      );
      vi.spyOn(serializers, 'serializeCategory');
      vi.spyOn(dbTransactions, 'persistTransactionPair');

      await expect(createTransferTransaction(transferDTO, USER_ID_STR)).rejects.toThrow(
        CategoryNotFoundError,
      );

      expect(dbCategories.findCategoryByName).toHaveBeenCalledOnce();
      expect(serializers.serializeCategory).not.toHaveBeenCalled();
      expect(dbTransactions.persistTransactionPair).not.toHaveBeenCalled();
      expect(getNextSourceIndex).not.toHaveBeenCalled();
    }
  );
});
