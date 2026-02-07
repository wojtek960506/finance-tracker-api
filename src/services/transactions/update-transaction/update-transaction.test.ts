import * as dbCategories from "@db/categories";
import * as dbTransactions from "@db/transactions";
import { afterEach, describe, expect, it, vi } from "vitest";
import { USER_ID_STR } from "@/test-utils/factories/general";
import {
  SystemCategoryHasOwner,
  SystemCategoryWrongType,
  SystemCategoryNotAllowed,
} from "@utils/errors";
import {
  updateStandardTransaction,
  updateExchangeTransaction,
  updateTransferTransaction,
} from "@services/transactions";
import {
  CATEGORY_TYPE_USER,
  CATEGORY_TYPE_SYSTEM,
  FOOD_CATEGORY_ID_STR,
  getUserCategoryResultJSON,
  getExchangeCategoryResultJSON,
  getTransferCategoryResultJSON,
} from "@/test-utils/factories/category";
import {
  STANDARD_TXN_ID_STR,
  getExchangeTransactionDTO,
  getTransferTransactionDTO,
  getStandardTransactionDTO,
  TRANSFER_TXN_EXPENSE_ID_STR,
  EXCHANGE_TXN_EXPENSE_ID_STR,
  getExchangeTransactionResultJSON,
  getTransferTransactionResultJSON,
  getStandardTransactionNotPopulatedResultJSON,
} from "@/test-utils/factories/transaction";


describe('update transaction', async () => {
  const standardDTO = getStandardTransactionDTO();
  const exchangeDTO = getExchangeTransactionDTO();
  const transferDTO = getTransferTransactionDTO();

  const transaction = getStandardTransactionNotPopulatedResultJSON();
  const transferPair = getTransferTransactionResultJSON();
  const exchangePair = getExchangeTransactionResultJSON();

  const foodCategory = getUserCategoryResultJSON();
  const transferCategory = getTransferCategoryResultJSON();
  const exchangeCategory = getExchangeCategoryResultJSON();

  afterEach(() => { vi.clearAllMocks() });

  it("update standard transaction", async () => {
    vi.spyOn(dbTransactions, "findTransaction").mockResolvedValue(transaction as any);
    vi.spyOn(dbTransactions, "saveTransactionChanges").mockResolvedValue(transaction as any);
    vi.spyOn(dbCategories, "findCategoryById").mockResolvedValue(foodCategory as any);

    const result = await updateStandardTransaction(STANDARD_TXN_ID_STR, USER_ID_STR, standardDTO);

    expect(dbCategories.findCategoryById).toHaveBeenCalledOnce();
    expect(dbCategories.findCategoryById).toHaveBeenCalledWith(FOOD_CATEGORY_ID_STR);
    expect(dbTransactions.findTransaction).toHaveBeenCalledOnce();
    expect(dbTransactions.findTransaction).toHaveBeenCalledWith(STANDARD_TXN_ID_STR);
    expect(dbTransactions.saveTransactionChanges).toHaveBeenCalledOnce();
    expect(
      dbTransactions.saveTransactionChanges
    ).toHaveBeenCalledWith(transaction, standardDTO);
    expect(result).toEqual(transaction);
  })

  it.each([
    ["transfer", transferPair, transferDTO, updateTransferTransaction, transferCategory],
    ["exchange", exchangePair, exchangeDTO, updateExchangeTransaction, exchangeCategory],
  ])('udate %s transaction', async (_, expectedResult, dto, updateFunc, category) => {
    vi.spyOn(dbTransactions, "loadTransactionWithReference")
      .mockResolvedValue(expectedResult as any);
    vi.spyOn(dbTransactions, "saveTransactionPairChanges")
      .mockResolvedValue(expectedResult as any);
    vi.spyOn(dbCategories, "findCategoryByName").mockResolvedValue(category as any)

    const result = await updateFunc(TRANSFER_TXN_EXPENSE_ID_STR, USER_ID_STR, dto as any);
    
    expect(dbCategories.findCategoryByName).toHaveBeenCalledOnce();
    expect(dbTransactions.loadTransactionWithReference).toHaveBeenCalledOnce();
    expect(dbTransactions.saveTransactionPairChanges).toHaveBeenCalledOnce();
    expect(result).toEqual(expectedResult);
  });

  it("throws when updating standard transaction with system category", async () => {
    vi.spyOn(dbCategories, "findCategoryById")
      .mockResolvedValue({ ...foodCategory, type: CATEGORY_TYPE_SYSTEM } as any);
    vi.spyOn(dbTransactions, "findTransaction");
    vi.spyOn(dbTransactions, "saveTransactionChanges");

    await expect(
      updateStandardTransaction(STANDARD_TXN_ID_STR, USER_ID_STR, standardDTO)
    ).rejects.toThrow(SystemCategoryNotAllowed);

    expect(dbCategories.findCategoryById).toHaveBeenCalledOnce();
    expect(dbTransactions.findTransaction).not.toHaveBeenCalled();
    expect(dbTransactions.saveTransactionChanges).not.toHaveBeenCalled();
  });

  it("throws when updating transaction pair with not system category", async () => {
    vi.spyOn(dbCategories, "findCategoryByName")
      .mockResolvedValue({ ...exchangeCategory, type: CATEGORY_TYPE_USER } as any);
    vi.spyOn(dbTransactions, "loadTransactionWithReference");
    vi.spyOn(dbTransactions, "saveTransactionPairChanges");

    await expect(
      updateExchangeTransaction(EXCHANGE_TXN_EXPENSE_ID_STR, USER_ID_STR, exchangeDTO)
    ).rejects.toThrow(SystemCategoryWrongType);

    expect(dbCategories.findCategoryByName).toHaveBeenCalledOnce();
    expect(dbTransactions.loadTransactionWithReference).not.toHaveBeenCalled();
    expect(dbTransactions.saveTransactionPairChanges).not.toHaveBeenCalled();
  });

  it("throws when updating transaction pair with system category which has owner", async () => {
    vi.spyOn(dbCategories, "findCategoryByName")
      .mockResolvedValue({ ...transferCategory, ownerId: USER_ID_STR } as any);
    vi.spyOn(dbTransactions, "loadTransactionWithReference");
    vi.spyOn(dbTransactions, "saveTransactionPairChanges");

    await expect(
      updateTransferTransaction(TRANSFER_TXN_EXPENSE_ID_STR, USER_ID_STR, transferDTO)
    ).rejects.toThrow(SystemCategoryHasOwner);

    expect(dbCategories.findCategoryByName).toHaveBeenCalledOnce();
    expect(dbTransactions.loadTransactionWithReference).not.toHaveBeenCalled();
    expect(dbTransactions.saveTransactionPairChanges).not.toHaveBeenCalled();
  });
});
