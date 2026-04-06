import { afterEach, describe, expect, it, Mock, vi } from 'vitest';

import * as namedResourceDb from '@named-resource/db';
import * as namedResourceConfig from '@named-resource/kind-config';
import {
  ACCOUNT_TYPE_USER,
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
import * as dbTransactions from '@transaction/db';
import { getNextSourceIndex } from '@transaction/services';
import {
  AccountOwnershipError,
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

describe('create transaction', () => {
  const foodCategory = getUserCategoryResultSerialized();
  const exchangeCategory = getExchangeCategoryResultJSON();
  const transferCategory = getTransferCategoryResultJSON();
  const standardDTO = getStandardTransactionDTO();
  const exchangeDTO = getExchangeTransactionDTO();
  const transferDTO = getTransferTransactionDTO();
  const paymentMethod = getBankTransferPaymentMethodResultJSON();
  const accountExpense = getSystemExpenseAccountResultSerialized();
  const accountIncome = getSystemIncomeAccountResultSerialized();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('creates standard transaction', async () => {
    const transaction = getStandardTransactionResultSerialized();

    vi.spyOn(namedResourceDb, 'findNamedResourceById')
      .mockResolvedValueOnce(foodCategory as any)
      .mockResolvedValueOnce(paymentMethod as any)
      .mockResolvedValueOnce(accountExpense as any);
    vi.spyOn(dbTransactions, 'persistTransaction').mockResolvedValue(transaction as any);
    (getNextSourceIndex as Mock).mockResolvedValue(STANDARD_TXN_SRC_IDX);

    const result = await createStandardTransaction(standardDTO, USER_ID_STR);

    expect(namedResourceDb.findNamedResourceById).toHaveBeenNthCalledWith(
      1,
      'category',
      FOOD_CATEGORY_ID_STR,
    );
    expect(namedResourceDb.findNamedResourceById).toHaveBeenNthCalledWith(
      2,
      'paymentMethod',
      standardDTO.paymentMethodId,
    );
    expect(namedResourceDb.findNamedResourceById).toHaveBeenNthCalledWith(
      3,
      'account',
      standardDTO.accountId,
    );
    expect(dbTransactions.persistTransaction).toHaveBeenCalledWith({
      ...standardDTO,
      ownerId: USER_ID_STR,
      sourceIndex: STANDARD_TXN_SRC_IDX,
    });
    expect(result).toEqual(transaction);
  });

  it('creates exchange transaction pair', async () => {
    const transactionPair = getExchangeTransactionResultSerialized();

    vi.spyOn(namedResourceDb, 'findNamedResourceById')
      .mockResolvedValueOnce(accountExpense as any)
      .mockResolvedValueOnce(paymentMethod as any);
    vi.spyOn(namedResourceDb, 'findNamedResourceByName').mockResolvedValue(
      exchangeCategory as any,
    );
    vi.spyOn(dbTransactions, 'persistTransactionPair').mockResolvedValue(
      transactionPair as any,
    );
    (getNextSourceIndex as Mock)
      .mockResolvedValueOnce(EXCHANGE_TXN_EXPENSE_SRC_IDX)
      .mockResolvedValueOnce(EXCHANGE_TXN_INCOME_SRC_IDX);

    const result = await createExchangeTransaction(exchangeDTO, USER_ID_STR);

    expect(namedResourceDb.findNamedResourceByName).toHaveBeenCalledWith(
      'category',
      EXCHANGE_CATEGORY_NAME,
    );
    expect(result).toEqual(transactionPair);
  });

  it('creates exchange transaction pair from a model-like system category', async () => {
    const transactionPair = getExchangeTransactionResultSerialized();
    const categoryModel = { toObject: vi.fn() };

    vi.spyOn(namedResourceDb, 'findNamedResourceById')
      .mockResolvedValueOnce(accountExpense as any)
      .mockResolvedValueOnce(paymentMethod as any);
    vi.spyOn(namedResourceDb, 'findNamedResourceByName').mockResolvedValue(
      categoryModel as any,
    );
    vi.spyOn(namedResourceConfig, 'getNamedResourceKindConfig').mockReturnValue({
      serialize: vi.fn().mockReturnValue(exchangeCategory),
    } as any);
    vi.spyOn(dbTransactions, 'persistTransactionPair').mockResolvedValue(
      transactionPair as any,
    );
    (getNextSourceIndex as Mock)
      .mockResolvedValueOnce(EXCHANGE_TXN_EXPENSE_SRC_IDX)
      .mockResolvedValueOnce(EXCHANGE_TXN_INCOME_SRC_IDX);

    const result = await createExchangeTransaction(exchangeDTO, USER_ID_STR);

    expect(namedResourceConfig.getNamedResourceKindConfig).toHaveBeenCalledWith(
      'category',
    );
    expect(result).toEqual(transactionPair);
  });

  it('creates transfer transaction pair', async () => {
    const transactionPair = getTransferTransactionResultSerialized();

    vi.spyOn(namedResourceDb, 'findNamedResourceById')
      .mockResolvedValueOnce(accountExpense as any)
      .mockResolvedValueOnce(accountIncome as any)
      .mockResolvedValueOnce(paymentMethod as any);
    vi.spyOn(namedResourceDb, 'findNamedResourceByName').mockResolvedValue(
      transferCategory as any,
    );
    vi.spyOn(dbTransactions, 'persistTransactionPair').mockResolvedValue(
      transactionPair as any,
    );
    (getNextSourceIndex as Mock)
      .mockResolvedValueOnce(TRANSFER_TXN_EXPENSE_SRC_IDX)
      .mockResolvedValueOnce(TRANSFER_TXN_INCOME_SRC_IDX);

    const result = await createTransferTransaction(transferDTO, USER_ID_STR);

    expect(namedResourceDb.findNamedResourceByName).toHaveBeenCalledWith(
      'category',
      TRANSFER_CATEGORY_NAME,
    );
    expect(result).toEqual(transactionPair);
  });

  it('throws when standard transaction uses system category', async () => {
    vi.spyOn(namedResourceDb, 'findNamedResourceById').mockResolvedValueOnce({
      ...foodCategory,
      type: CATEGORY_TYPE_SYSTEM,
    } as any);

    await expect(createStandardTransaction(standardDTO, USER_ID_STR)).rejects.toThrow(
      SystemCategoryNotAllowed,
    );
  });

  it('throws when payment method is not owned by user', async () => {
    vi.spyOn(namedResourceDb, 'findNamedResourceById')
      .mockResolvedValueOnce(foodCategory as any)
      .mockResolvedValueOnce({
        ...paymentMethod,
        type: CATEGORY_TYPE_USER,
        ownerId: '123',
        id: '1',
      } as any);

    await expect(createStandardTransaction(standardDTO, USER_ID_STR)).rejects.toThrow(
      PaymentMethodOwnershipError,
    );
  });

  it('throws when account is not owned by user', async () => {
    vi.spyOn(namedResourceDb, 'findNamedResourceById')
      .mockResolvedValueOnce(foodCategory as any)
      .mockResolvedValueOnce(paymentMethod as any)
      .mockResolvedValueOnce({
        ...accountExpense,
        type: ACCOUNT_TYPE_USER,
        ownerId: '123',
        id: '1',
      } as any);

    await expect(createStandardTransaction(standardDTO, USER_ID_STR)).rejects.toThrow(
      AccountOwnershipError,
    );
  });

  it('throws when pair transaction resolves non-system category', async () => {
    vi.spyOn(namedResourceDb, 'findNamedResourceById')
      .mockResolvedValueOnce(accountExpense as any)
      .mockResolvedValueOnce(paymentMethod as any);
    vi.spyOn(namedResourceDb, 'findNamedResourceByName').mockResolvedValue({
      ...exchangeCategory,
      type: CATEGORY_TYPE_USER,
    } as any);

    await expect(createExchangeTransaction(exchangeDTO, USER_ID_STR)).rejects.toThrow(
      SystemCategoryWrongType,
    );
  });

  it('throws when pair transaction system category has owner', async () => {
    vi.spyOn(namedResourceDb, 'findNamedResourceById')
      .mockResolvedValueOnce(accountExpense as any)
      .mockResolvedValueOnce(paymentMethod as any);
    vi.spyOn(namedResourceDb, 'findNamedResourceByName').mockResolvedValue({
      ...exchangeCategory,
      ownerId: USER_ID_STR,
    } as any);

    await expect(createExchangeTransaction(exchangeDTO, USER_ID_STR)).rejects.toThrow(
      SystemCategoryHasOwner,
    );
  });

  it('throws when pair transaction category is missing', async () => {
    vi.spyOn(namedResourceDb, 'findNamedResourceById')
      .mockResolvedValueOnce(accountExpense as any)
      .mockResolvedValueOnce(paymentMethod as any);
    vi.spyOn(namedResourceDb, 'findNamedResourceByName').mockResolvedValue(null);

    await expect(createExchangeTransaction(exchangeDTO, USER_ID_STR)).rejects.toThrow(
      CategoryNotFoundError,
    );
  });
});
