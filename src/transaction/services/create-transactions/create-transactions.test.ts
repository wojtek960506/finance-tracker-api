import { afterEach, describe, expect, it, Mock, vi } from 'vitest';

import * as namedResourceDb from '@named-resource/db';
import {
  getSystemExpenseAccountResultSerialized,
  getSystemIncomeAccountResultSerialized,
} from '@testing/factories/account';
import {
  EXCHANGE_CATEGORY_NAME,
  FOOD_CATEGORY_ID_STR,
  getExchangeCategoryResultSerialized,
  getTransferCategoryResultSerialized,
  getUserCategoryResultSerialized,
  TRANSFER_CATEGORY_NAME,
} from '@testing/factories/category';
import { USER_ID_STR } from '@testing/factories/general';
import { getBankTransferPaymentMethodResultSerialized } from '@testing/factories/payment-method';
import {
  getExchangeTransactionDTO,
  getExchangeTransactionProps,
  getStandardTransactionDTO,
  getStandardTransactionProps,
  getTransferTransactionDTO,
  getTransferTransactionProps,
} from '@testing/factories/transaction';
import * as transactionDb from '@transaction/db';
import { getNextSourceIndices } from '@transaction/services/get-next-source-index';

import { createTransactions } from './create-transactions';

vi.mock('@transaction/services/get-next-source-index', () => ({
  getNextSourceIndices: vi.fn(),
}));

describe('create transactions in bulk', () => {
  const foodCategory = getUserCategoryResultSerialized();
  const exchangeCategory = getExchangeCategoryResultSerialized();
  const transferCategory = getTransferCategoryResultSerialized();
  const paymentMethod = getBankTransferPaymentMethodResultSerialized();
  const accountExpense = getSystemExpenseAccountResultSerialized();
  const accountIncome = getSystemIncomeAccountResultSerialized();
  const standardDTO = getStandardTransactionDTO();
  const exchangeDTO = getExchangeTransactionDTO();
  const transferDTO = getTransferTransactionDTO();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('prepares mixed transactions and persists them in a single batch', async () => {
    const { expenseProps: exchangeExpenseProps, incomeProps: exchangeIncomeProps } =
      getExchangeTransactionProps(true);
    const { expenseProps: transferExpenseProps, incomeProps: transferIncomeProps } =
      getTransferTransactionProps(true);
    const expectedPreparedTransactions = [
      getStandardTransactionProps(),
      exchangeExpenseProps,
      exchangeIncomeProps,
      transferExpenseProps,
      transferIncomeProps,
    ];

    vi.spyOn(namedResourceDb, 'findNamedResourceById')
      .mockResolvedValueOnce(foodCategory as any)
      .mockResolvedValueOnce(paymentMethod as any)
      .mockResolvedValueOnce(accountExpense as any)
      .mockResolvedValueOnce(accountExpense as any)
      .mockResolvedValueOnce(accountIncome as any)
      .mockResolvedValueOnce(paymentMethod as any)
      .mockResolvedValueOnce(accountExpense as any)
      .mockResolvedValueOnce(accountIncome as any)
      .mockResolvedValueOnce(paymentMethod as any);
    vi.spyOn(namedResourceDb, 'findNamedResourceByName')
      .mockResolvedValueOnce(exchangeCategory as any)
      .mockResolvedValueOnce(transferCategory as any);
    vi.spyOn(transactionDb, 'persistTransactions').mockResolvedValue([] as any);
    (getNextSourceIndices as Mock).mockResolvedValue([1, 2, 3, 4, 5]);

    await createTransactions(
      { transactions: [standardDTO, exchangeDTO, transferDTO] },
      USER_ID_STR,
    );

    expect(getNextSourceIndices).toHaveBeenCalledOnce();
    expect(getNextSourceIndices).toHaveBeenCalledWith(USER_ID_STR, 5);
    expect(namedResourceDb.findNamedResourceByName).toHaveBeenNthCalledWith(
      1,
      'category',
      EXCHANGE_CATEGORY_NAME,
    );
    expect(namedResourceDb.findNamedResourceByName).toHaveBeenNthCalledWith(
      2,
      'category',
      TRANSFER_CATEGORY_NAME,
    );
    expect(namedResourceDb.findNamedResourceById).toHaveBeenNthCalledWith(
      1,
      'category',
      FOOD_CATEGORY_ID_STR,
    );
    expect(transactionDb.persistTransactions).toHaveBeenCalledOnce();
    expect(transactionDb.persistTransactions).toHaveBeenCalledWith(
      expectedPreparedTransactions,
    );
  });
});
