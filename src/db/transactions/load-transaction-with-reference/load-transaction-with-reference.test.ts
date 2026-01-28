import { randomObjectIdString } from "@utils/random";
import { loadTransactionWithReference } from "@db/transactions";
import { afterEach, describe, expect, it, Mock, vi } from "vitest";
import { findTransaction } from "@db/transactions/find-transaction";
import { getTransferTransactionResultJSON } from "@/test-utils/mocks/transactions";
import {
  TransactionWrongTypesError,
  TransactionWrongReferenceError,
  TransactionExchangeCategoryError,
  TransactionMissingReferenceError,
  TransactionTransferCategoryError,
} from "@utils/errors";


vi.mock("@db/transactions/find-transaction", () => ({ findTransaction: vi.fn() }));

describe('loadTransactionWithReference', () => {
  
  const [E_ID, I_ID] = [randomObjectIdString(), randomObjectIdString()];
  const [E_SRC_IDX, I_SRC_IDX] = [1, 2];
  const OWNER_ID = randomObjectIdString();
  const TRANSFER_CATEGORY = "myAccount";
  const EXCHANGE_CATEGORY = "exchange";
  
  const [expenseTransaction, incomeTransaction] = getTransferTransactionResultJSON(
    OWNER_ID, E_SRC_IDX, I_SRC_IDX, E_ID, I_ID
  );

  afterEach(() => { vi.clearAllMocks() });

  it("loaded correctly", async () => {
    (findTransaction as Mock)
      .mockResolvedValueOnce(expenseTransaction)
      .mockResolvedValueOnce(incomeTransaction);

    const { transaction, transactionRef } = await loadTransactionWithReference(
      E_ID, OWNER_ID, TRANSFER_CATEGORY
    );

    expect(findTransaction).toHaveBeenCalledTimes(2);
    expect(findTransaction).toHaveBeenNthCalledWith(1, E_ID);
    expect(findTransaction).toHaveBeenNthCalledWith(2, I_ID);
    expect(transaction).toEqual(expenseTransaction);
    expect(transactionRef).toEqual(incomeTransaction);
  });

  it.each([
    ["transfer", TRANSFER_CATEGORY, TransactionTransferCategoryError],
    ["exchange", EXCHANGE_CATEGORY, TransactionExchangeCategoryError]
  ])("throws if reference transaction has wrong category ('%s')",
    async (_, expectedCategory, expectedError) => {
      (findTransaction as Mock)
        .mockResolvedValueOnce({ ...expenseTransaction, category: "food" })  

      await expect(
        loadTransactionWithReference(E_ID, OWNER_ID, expectedCategory as "exchange" | "myAccount")
      ).rejects.toThrow(expectedError);
      expect(findTransaction).toHaveBeenCalledTimes(1);
    }
  );

  it("throws if main transaction is missing refId", async () => {
    (findTransaction as Mock)
      .mockResolvedValueOnce({ ...expenseTransaction, refId: undefined });

    await expect(
      loadTransactionWithReference(E_ID, OWNER_ID, TRANSFER_CATEGORY)
    ).rejects.toThrow(TransactionMissingReferenceError);
    expect(findTransaction).toHaveBeenCalledOnce();
  });

  it.each([
    ["transfer", TRANSFER_CATEGORY, TransactionTransferCategoryError],
    ["exchange", EXCHANGE_CATEGORY, TransactionExchangeCategoryError]
  ])("throws if reference transaction has wrong category ('%s')",
    async (_, expectedCategory, expectedError) => {
      (findTransaction as Mock)
        .mockResolvedValueOnce({ ...expenseTransaction, category: expectedCategory })  
        .mockResolvedValueOnce({ ...incomeTransaction, category: "food" });

      await expect(
        loadTransactionWithReference(E_ID, OWNER_ID, expectedCategory as "exchange" | "myAccount")
      ).rejects.toThrow(expectedError);
      expect(findTransaction).toHaveBeenCalledTimes(2);
    }
  );

  it("throws if reference transaction is missing refId", async () => {
    (findTransaction as Mock)
      .mockResolvedValueOnce(expenseTransaction)
      .mockResolvedValueOnce({ ...incomeTransaction, refId: undefined });

    await expect(
      loadTransactionWithReference(E_ID, OWNER_ID, TRANSFER_CATEGORY)
    ).rejects.toThrow(TransactionMissingReferenceError);
    expect(findTransaction).toHaveBeenCalledTimes(2);
  });

  it("throws if reference transaction's refId is not pointing to main transaction", async () => {
    (findTransaction as Mock)
      .mockResolvedValueOnce(expenseTransaction)
      .mockResolvedValueOnce({ ...incomeTransaction, refId: "123" });

    await expect(
      loadTransactionWithReference(E_ID, OWNER_ID, TRANSFER_CATEGORY)
    ).rejects.toThrow(TransactionWrongReferenceError);
    expect(findTransaction).toHaveBeenCalledTimes(2);
  });

  it("throws if both transactions have the same type", async () => {
    (findTransaction as Mock)
      .mockResolvedValueOnce({ ...expenseTransaction, transactionType: "expense" })
      .mockResolvedValueOnce({ ...incomeTransaction, transactionType: "expense" });

    await expect(
      loadTransactionWithReference(E_ID, OWNER_ID, TRANSFER_CATEGORY)
    ).rejects.toThrow(TransactionWrongTypesError);
    expect(findTransaction).toHaveBeenCalledTimes(2);
  });
})