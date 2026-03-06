import * as dbCategories from "@category/db"
import * as dbTransactions from "@transaction/db"
import * as serializers from "@category/serializers"
import * as dbPaymentMethods from "@payment-method/db"
import { getNextSourceIndex } from "@transaction/services"
import { USER_ID_STR } from "@/test-utils/factories/general"
import { it, vi, Mock, expect, describe, afterEach } from "vitest"
import {
  CategoryNotFoundError,
  SystemCategoryHasOwner,
  SystemCategoryWrongType,
  SystemCategoryNotAllowed,
} from "@utils/errors"
import {
  createExchangeTransaction,
  createStandardTransaction,
  createTransferTransaction,
} from "./create-transaction"
import {
  CATEGORY_TYPE_USER,
  CATEGORY_TYPE_SYSTEM,
  FOOD_CATEGORY_ID_STR,
  EXCHANGE_CATEGORY_NAME,
  TRANSFER_CATEGORY_NAME,
  getUserCategoryResultJSON,
  getExchangeCategoryResultJSON,
  getTransferCategoryResultJSON,
} from "@/test-utils/factories/category"
import {
  STANDARD_TXN_SRC_IDX,
  getExchangeTransactionDTO,
  getStandardTransactionDTO,
  getTransferTransactionDTO,
  EXCHANGE_TXN_INCOME_SRC_IDX,
  TRANSFER_TXN_INCOME_SRC_IDX,
  EXCHANGE_TXN_EXPENSE_SRC_IDX,
  TRANSFER_TXN_EXPENSE_SRC_IDX,
  getExchangeTransactionResultSerialized,
  getStandardTransactionResultSerialized,
  getTransferTransactionResultSerialized,
} from "@/test-utils/factories/transaction"
import {
  getBankTransferPaymentMethodResultJSON,
} from "@/test-utils/factories/payment-method"


vi.mock("@transaction/services/get-next-source-index", () => ({
  getNextSourceIndex: vi.fn(),
}));

describe("createStandardTransaction", async () => {

  afterEach(() => { vi.clearAllMocks() });

  const foodCategory = getUserCategoryResultJSON();
  const exchangeCategory = getExchangeCategoryResultJSON();
  const transferCategory = getTransferCategoryResultJSON();
  const standardDTO = getStandardTransactionDTO();
  const exchangeDTO = getExchangeTransactionDTO();
  const transferDTO = getTransferTransactionDTO();
  const paymentMethod = getBankTransferPaymentMethodResultJSON();

  it("should create standard transaction", async () => {
    const transaction = getStandardTransactionResultSerialized();

    vi.spyOn(dbTransactions, "persistTransaction").mockResolvedValue(transaction as any);
    (getNextSourceIndex as Mock).mockResolvedValue(STANDARD_TXN_SRC_IDX);
    vi.spyOn(dbCategories, "findCategoryById").mockResolvedValue(foodCategory as any);
    vi.spyOn(dbPaymentMethods, "findPaymentMethodById").mockResolvedValue(paymentMethod as any);

    const result = await createStandardTransaction(standardDTO, USER_ID_STR);

    expect(dbCategories.findCategoryById).toHaveBeenCalledOnce();
    expect(dbCategories.findCategoryById).toHaveBeenCalledWith(FOOD_CATEGORY_ID_STR);
    expect(dbTransactions.persistTransaction).toHaveBeenCalledOnce();
    expect(dbPaymentMethods.findPaymentMethodById).toHaveBeenCalledOnce();
    expect(getNextSourceIndex).toHaveBeenCalledOnce();
    expect(getNextSourceIndex).toHaveBeenCalledWith(USER_ID_STR);
    expect(result).toEqual(transaction);
  });

  it("should create exchange transaction", async () => {
    const transactionPair = getExchangeTransactionResultSerialized();

    vi.spyOn(dbTransactions, "persistTransactionPair").mockResolvedValue(transactionPair as any);
    (getNextSourceIndex as Mock)
      .mockResolvedValueOnce(EXCHANGE_TXN_EXPENSE_SRC_IDX)
      .mockResolvedValueOnce(EXCHANGE_TXN_INCOME_SRC_IDX);
    vi.spyOn(dbCategories, "findCategoryByName").mockResolvedValue(exchangeCategory as any);
    vi.spyOn(serializers, "serializeCategory").mockReturnValue(exchangeCategory as any);
    
    const result = await createExchangeTransaction(exchangeDTO, USER_ID_STR);

    expect(dbCategories.findCategoryByName).toHaveBeenCalledOnce();
    expect(dbCategories.findCategoryByName).toHaveBeenCalledWith(EXCHANGE_CATEGORY_NAME);
    expect(serializers.serializeCategory).toHaveBeenCalledOnce();
    expect(serializers.serializeCategory).toHaveBeenCalledWith(exchangeCategory);
    expect(dbTransactions.persistTransactionPair).toHaveBeenCalledOnce();
    expect(getNextSourceIndex).toHaveBeenCalledTimes(2);
    expect(getNextSourceIndex).toHaveBeenNthCalledWith(1, USER_ID_STR);
    expect(getNextSourceIndex).toHaveBeenNthCalledWith(2, USER_ID_STR);
    expect(result).toEqual(transactionPair);
  });

  it("should create transfer transaction", async () => {
    const transactionPair = getTransferTransactionResultSerialized();

    vi.spyOn(dbTransactions, "persistTransactionPair").mockResolvedValue(transactionPair as any);
    (getNextSourceIndex as Mock)
      .mockResolvedValueOnce(TRANSFER_TXN_EXPENSE_SRC_IDX)
      .mockResolvedValueOnce(TRANSFER_TXN_INCOME_SRC_IDX);
    vi.spyOn(dbCategories, "findCategoryByName").mockResolvedValue(transferCategory as any);
    vi.spyOn(serializers, "serializeCategory").mockReturnValue(transferCategory as any);
    
    const result = await createTransferTransaction(transferDTO, USER_ID_STR);

    expect(dbCategories.findCategoryByName).toHaveBeenCalledOnce();
    expect(dbCategories.findCategoryByName).toHaveBeenCalledWith(TRANSFER_CATEGORY_NAME);
    expect(serializers.serializeCategory).toHaveBeenCalledOnce();
    expect(serializers.serializeCategory).toHaveBeenCalledWith(transferCategory);
    expect(dbTransactions.persistTransactionPair).toHaveBeenCalledOnce();
    expect(getNextSourceIndex).toHaveBeenCalledTimes(2);
    expect(getNextSourceIndex).toHaveBeenNthCalledWith(1, USER_ID_STR);
    expect(getNextSourceIndex).toHaveBeenNthCalledWith(2, USER_ID_STR);
    expect(result).toEqual(transactionPair);
  });

  it("should throw error when creating single transaction with system category", async () => {

    vi.spyOn(dbCategories, "findCategoryById").mockResolvedValue(
      { ...foodCategory, type: CATEGORY_TYPE_SYSTEM} as any
    );
    vi.spyOn(dbTransactions, "persistTransaction");

    await expect(createStandardTransaction(standardDTO, USER_ID_STR)).rejects.toThrow(
      SystemCategoryNotAllowed
    );

    expect(dbCategories.findCategoryById).toHaveBeenCalledOnce();
    expect(dbTransactions.persistTransaction).not.toHaveBeenCalled();
    expect(getNextSourceIndex).not.toHaveBeenCalled();
  });

  it("should throw error when creating transaction pair with user category", async () => {
    vi.spyOn(dbCategories, "findCategoryByName").mockResolvedValue(exchangeCategory as any);
    vi.spyOn(serializers, "serializeCategory").mockReturnValue(
      { ...exchangeCategory, type: CATEGORY_TYPE_USER } as any
    );
    vi.spyOn(dbTransactions, "persistTransactionPair");

    await expect(createExchangeTransaction(exchangeDTO, USER_ID_STR)).rejects.toThrow(
      SystemCategoryWrongType
    );

    expect(dbCategories.findCategoryByName).toHaveBeenCalledOnce();
    expect(serializers.serializeCategory).toHaveBeenCalledOnce();
    expect(dbTransactions.persistTransactionPair).not.toHaveBeenCalled();
    expect(getNextSourceIndex).not.toHaveBeenCalled();
  });

  it(
    "should throw error when creating transaction pair with system category with owner",
    async () => {
      vi.spyOn(dbCategories, "findCategoryByName").mockResolvedValue(transferCategory as any);
      vi.spyOn(serializers, "serializeCategory").mockReturnValue(
        { ...transferCategory, ownerId: USER_ID_STR } as any
      );
      vi.spyOn(dbTransactions, "persistTransactionPair");

      await expect(createTransferTransaction(transferDTO, USER_ID_STR)).rejects.toThrow(
        SystemCategoryHasOwner
      );

      expect(dbCategories.findCategoryByName).toHaveBeenCalledOnce();
      expect(serializers.serializeCategory).toHaveBeenCalledOnce();
      expect(dbTransactions.persistTransactionPair).not.toHaveBeenCalled();
      expect(getNextSourceIndex).not.toHaveBeenCalled();
  });

  it(
    "should throw error when category not found by name for creating transaction pair",
    async () => {
      vi.spyOn(dbCategories, "findCategoryByName").mockResolvedValue(null);
      vi.spyOn(serializers, "serializeCategory");
      vi.spyOn(dbTransactions, "persistTransactionPair");

      await expect(createTransferTransaction(transferDTO, USER_ID_STR)).rejects.toThrow(
        CategoryNotFoundError
      );

      expect(dbCategories.findCategoryByName).toHaveBeenCalledOnce();
      expect(serializers.serializeCategory).not.toHaveBeenCalled();
      expect(dbTransactions.persistTransactionPair).not.toHaveBeenCalled();
      expect(getNextSourceIndex).not.toHaveBeenCalled();
    }
  )
});
