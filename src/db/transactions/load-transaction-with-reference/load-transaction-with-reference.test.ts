import { USER_ID_STR } from "@/test-utils/factories/general";
import { afterEach, describe, expect, it, Mock, vi } from "vitest";
import { findTransaction } from "@db/transactions/find-transaction";
import { loadTransactionWithReference, SystemCategoryName } from "@db/transactions";
import {
  TransactionWrongTypesError,
  TransactionWrongReferenceError,
  TransactionExchangeCategoryError,
  TransactionMissingReferenceError,
  TransactionTransferCategoryError,
} from "@utils/errors";
import {
  FOOD_CATEGORY_ID_STR,
  EXCHANGE_CATEGORY_NAME,
  EXCHANGE_CATEGORY_ID_STR,
} from "@/test-utils/factories/category";
import {
  TRANSACTION_TYPE_EXPENSE,
  EXCHANGE_TXN_INCOME_ID_STR,
  EXCHANGE_TXN_EXPENSE_ID_STR,
  getExchangeTransactionNotPopulatedResultJSON,
} from "@/test-utils/factories/transaction";


vi.mock("@db/transactions/find-transaction", () => ({ findTransaction: vi.fn() }));

describe('loadTransactionWithReference', () => {
  
  const {
    expenseTransactionNotPopulatedJSON,
    incomeTransactionNotPopulatedJSON,
  } = getExchangeTransactionNotPopulatedResultJSON();

  afterEach(() => { vi.clearAllMocks() });

  it("loaded correctly", async () => {
    (findTransaction as Mock)
      .mockResolvedValueOnce(expenseTransactionNotPopulatedJSON)
      .mockResolvedValueOnce(incomeTransactionNotPopulatedJSON);

    const { transaction, transactionRef } = await loadTransactionWithReference(
      EXCHANGE_TXN_EXPENSE_ID_STR, USER_ID_STR, EXCHANGE_CATEGORY_ID_STR, EXCHANGE_CATEGORY_NAME
    );

    expect(findTransaction).toHaveBeenCalledTimes(2);
    expect(findTransaction).toHaveBeenNthCalledWith(1, EXCHANGE_TXN_EXPENSE_ID_STR);
    expect(findTransaction).toHaveBeenNthCalledWith(2, EXCHANGE_TXN_INCOME_ID_STR);
    expect(transaction).toEqual(expenseTransactionNotPopulatedJSON);
    expect(transactionRef).toEqual(incomeTransactionNotPopulatedJSON);
  });

  it.each([
    // TODO - uncomment it when proper test data factories will be created for transfer transaction
    // ["transfer", TRANSFER_CATEGORY, TransactionTransferCategoryError],
    [
      "exchange",
      EXCHANGE_CATEGORY_ID_STR,
      EXCHANGE_CATEGORY_NAME,
      TransactionExchangeCategoryError
    ],
  ])("throws if reference transaction has wrong category ('%s')",
    async (_, expectedCategoryId, expectedCategoryName, expectedError) => {
      (findTransaction as Mock).mockResolvedValueOnce(
        { ...expenseTransactionNotPopulatedJSON, categoryId: FOOD_CATEGORY_ID_STR }
      );  

      await expect(loadTransactionWithReference(
        EXCHANGE_TXN_EXPENSE_ID_STR,
        USER_ID_STR,
        expectedCategoryId,
        expectedCategoryName as SystemCategoryName,
      )).rejects.toThrow(expectedError);
      expect(findTransaction).toHaveBeenCalledTimes(1);
    }
  );

  it("throws if main transaction is missing refId", async () => {
    (findTransaction as Mock)
      .mockResolvedValueOnce({ ...expenseTransactionNotPopulatedJSON, refId: undefined });

    await expect(loadTransactionWithReference(
      EXCHANGE_TXN_EXPENSE_ID_STR, USER_ID_STR, EXCHANGE_CATEGORY_ID_STR, EXCHANGE_CATEGORY_NAME
    )).rejects.toThrow(TransactionMissingReferenceError);
    expect(findTransaction).toHaveBeenCalledOnce();
  });

  it.each([
    // TODO - uncomment it when proper test data factories will be created for transfer transaction
    // ["transfer", TRANSFER_CATEGORY, TransactionTransferCategoryError],
    [
      "exchange",
      EXCHANGE_CATEGORY_ID_STR,
      EXCHANGE_CATEGORY_NAME,
      TransactionExchangeCategoryError
    ],
  ])("throws if reference transaction has wrong category ('%s')",
    async (_, expectedCategoryId, expectedCategoryName, expectedError) => {
      (findTransaction as Mock)
        .mockResolvedValueOnce(expenseTransactionNotPopulatedJSON)  
        .mockResolvedValueOnce(
          { ...incomeTransactionNotPopulatedJSON, categoryId: FOOD_CATEGORY_ID_STR }
        );

      await expect(loadTransactionWithReference(
        EXCHANGE_TXN_EXPENSE_ID_STR,
        USER_ID_STR,
        expectedCategoryId,
        expectedCategoryName as SystemCategoryName,
      )).rejects.toThrow(expectedError);
      expect(findTransaction).toHaveBeenCalledTimes(2);
    }
  );

  it("throws if reference transaction is missing refId", async () => {
    (findTransaction as Mock)
      .mockResolvedValueOnce(expenseTransactionNotPopulatedJSON)
      .mockResolvedValueOnce({ ...incomeTransactionNotPopulatedJSON, refId: undefined });

    await expect(loadTransactionWithReference(
      EXCHANGE_TXN_EXPENSE_ID_STR, USER_ID_STR, EXCHANGE_CATEGORY_ID_STR, EXCHANGE_CATEGORY_NAME
    )).rejects.toThrow(TransactionMissingReferenceError);
    expect(findTransaction).toHaveBeenCalledTimes(2);
  });

  it("throws if reference transaction's refId is not pointing to main transaction", async () => {
    (findTransaction as Mock)
      .mockResolvedValueOnce(expenseTransactionNotPopulatedJSON)
      .mockResolvedValueOnce(
        { ...incomeTransactionNotPopulatedJSON, refId: EXCHANGE_TXN_INCOME_ID_STR }
      );

    await expect(loadTransactionWithReference(
      EXCHANGE_TXN_EXPENSE_ID_STR, USER_ID_STR, EXCHANGE_CATEGORY_ID_STR, EXCHANGE_CATEGORY_NAME
    )).rejects.toThrow(TransactionWrongReferenceError);
    expect(findTransaction).toHaveBeenCalledTimes(2);
  });

  it("throws if both transactions have the same type", async () => {
    (findTransaction as Mock)
      .mockResolvedValueOnce(
        { ...expenseTransactionNotPopulatedJSON, transactionType: TRANSACTION_TYPE_EXPENSE })
      .mockResolvedValueOnce(
        { ...incomeTransactionNotPopulatedJSON, transactionType: TRANSACTION_TYPE_EXPENSE });

    await expect(loadTransactionWithReference(
      EXCHANGE_TXN_EXPENSE_ID_STR, USER_ID_STR, EXCHANGE_CATEGORY_ID_STR, EXCHANGE_CATEGORY_NAME
    )).rejects.toThrow(TransactionWrongTypesError);
    expect(findTransaction).toHaveBeenCalledTimes(2);
  });
})