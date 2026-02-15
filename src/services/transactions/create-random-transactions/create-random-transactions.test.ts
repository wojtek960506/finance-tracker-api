import { AppError } from "@utils/errors";
import { randomDate, randomFromSet } from "@utils/random";
import { getOrCreateCategory } from "@services/categories";
import { TransactionModel } from "@models/transaction-model";
import { afterEach, describe, expect, it, Mock, vi } from "vitest";
import { createRandomTransactions } from "./create-random-transactions";
import { TEST_CATEGORIES, TEST_DATE, TEST_OWNER_ID } from "./test-fixtures";
import {
  prepareRandomStandardTransaction,
  prepareRandomExchangeTransactionPair,
  prepareRandomTransferTransactionPair,
} from "./prepare-random-transaction";


vi.mock("@services/categories", () => ({
  getOrCreateCategory: vi.fn(),
}));

vi.mock("@utils/random", () => ({
  randomDate: vi.fn(),
  randomFromSet: vi.fn(),
}));

vi.mock("@models/transaction-model", () => ({
  TransactionModel: {
    insertMany: vi.fn(),
    bulkWrite: vi.fn(),
  },
}));

vi.mock("./prepare-random-transaction", () => ({
  prepareRandomStandardTransaction: vi.fn(),
  prepareRandomExchangeTransactionPair: vi.fn(),
  prepareRandomTransferTransactionPair: vi.fn(),
}));

describe("createRandomTransactions", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("creates random transactions and links reference ids for paired transactions", async () => {
    const session = {} as any;
    const standardTransaction = {
      ownerId: TEST_OWNER_ID,
      sourceIndex: 0,
      amount: 20,
      categoryId: "cat-food",
      type: "expense",
      title: "Food expense",
      transactionDate: TEST_DATE,
    };
    const transferExpense = {
      ownerId: TEST_OWNER_ID,
      sourceIndex: 1,
      sourceRefIndex: 2,
      amount: 50,
      categoryId: "cat-my-account",
      type: "expense",
      title: "Transfer out",
      transactionDate: TEST_DATE,
    };
    const transferIncome = {
      ownerId: TEST_OWNER_ID,
      sourceIndex: 2,
      sourceRefIndex: 1,
      amount: 50,
      categoryId: "cat-my-account",
      type: "income",
      title: "Transfer in",
      transactionDate: TEST_DATE,
    };
    const exchangeExpense = {
      ownerId: TEST_OWNER_ID,
      sourceIndex: 3,
      sourceRefIndex: 4,
      amount: 50,
      categoryId: "cat-exchange",
      type: "expense",
      title: "Exchange out",
      transactionDate: TEST_DATE,
    };
    const exchangeIncome = {
      ownerId: TEST_OWNER_ID,
      sourceIndex: 4,
      sourceRefIndex: 3,
      amount: 50,
      categoryId: "cat-exchange",
      type: "income",
      title: "Exchange in",
      transactionDate: TEST_DATE,
    };


    (getOrCreateCategory as Mock)
      .mockResolvedValueOnce(TEST_CATEGORIES[0])
      .mockResolvedValueOnce(TEST_CATEGORIES[1])
      .mockResolvedValueOnce(TEST_CATEGORIES[2])
      .mockResolvedValueOnce(TEST_CATEGORIES[3])
      .mockResolvedValueOnce(TEST_CATEGORIES[4])
      .mockResolvedValueOnce(TEST_CATEGORIES[5])
      .mockResolvedValueOnce(TEST_CATEGORIES[6]);
    (randomDate as Mock).mockReturnValue(TEST_DATE);
    (randomFromSet as Mock)
      .mockReturnValueOnce("cat-food")
      .mockReturnValueOnce("cat-my-account")
      .mockReturnValueOnce("cat-exchange");
    (prepareRandomStandardTransaction as Mock).mockReturnValue(standardTransaction);
    (prepareRandomTransferTransactionPair as Mock).mockReturnValue([
      transferExpense,
      transferIncome,
    ]);
    (prepareRandomExchangeTransactionPair as Mock).mockReturnValue([
      exchangeExpense,
      exchangeIncome,
    ]);
    (TransactionModel.insertMany as Mock).mockResolvedValue({
      insertedIds: { 0: "id-0", 1: "id-1", 2: "id-2", 3: "id-3", 4: "id-4" },
      insertedCount: 5,
    });
    (TransactionModel.bulkWrite as Mock).mockResolvedValue({
      modifiedCount: 4,
    });

    const result = await createRandomTransactions(TEST_OWNER_ID, 5, session);

    expect(getOrCreateCategory).toHaveBeenCalledTimes(7);
    expect(randomFromSet).toHaveBeenCalledTimes(3);
    expect(prepareRandomStandardTransaction).toHaveBeenCalledOnce();
    expect(prepareRandomStandardTransaction).toHaveBeenCalledWith(
      TEST_OWNER_ID,
      TEST_DATE,
      0,
      "cat-food",
    );
    expect(prepareRandomTransferTransactionPair).toHaveBeenCalledOnce();
    expect(prepareRandomTransferTransactionPair).toHaveBeenCalledWith(
      TEST_OWNER_ID,
      TEST_DATE,
      1,
      "cat-my-account",
    );
    expect(prepareRandomExchangeTransactionPair).toHaveBeenCalledOnce();
    expect(prepareRandomExchangeTransactionPair).toHaveBeenCalledWith(
      TEST_OWNER_ID,
      TEST_DATE,
      3,
      "cat-exchange",
    );
    expect(TransactionModel.insertMany).toHaveBeenCalledOnce();
    expect(TransactionModel.insertMany).toHaveBeenCalledWith(
      [standardTransaction, transferExpense, transferIncome, exchangeExpense, exchangeIncome],
      { rawResult: true, session },
    );
    expect(TransactionModel.bulkWrite).toHaveBeenCalledOnce();
    expect(TransactionModel.bulkWrite).toHaveBeenCalledWith(
      [
        {
          updateOne: {
            filter: { _id: "id-1" },
            update: { $set: { refId: "id-2" } },
          },
        },
        {
          updateOne: {
            filter: { _id: "id-2" },
            update: { $set: { refId: "id-1" } },
          },
        },
        {
          updateOne: {
            filter: { _id: "id-3" },
            update: { $set: { refId: "id-4" } },
          },
        },
        {
          updateOne: {
            filter: { _id: "id-4" },
            update: { $set: { refId: "id-3" } },
          },
        },
      ],
      { session },
    );
    expect(result).toBe(5);
  });

  it("throws AppError when not all inserted ids are returned", async () => {
    const standardTransaction = {
      ownerId: TEST_OWNER_ID,
      sourceIndex: 0,
      amount: 20,
      categoryId: "cat-food",
      type: "expense",
      title: "Food expense",
      transactionDate: TEST_DATE,
    };
    const transferExpense = {
      ownerId: TEST_OWNER_ID,
      sourceIndex: 1,
      sourceRefIndex: 2,
      amount: 50,
      categoryId: "cat-my-account",
      type: "expense",
      title: "Transfer out",
      transactionDate: TEST_DATE,
    };
    const transferIncome = {
      ownerId: TEST_OWNER_ID,
      sourceIndex: 2,
      sourceRefIndex: 1,
      amount: 50,
      categoryId: "cat-my-account",
      type: "income",
      title: "Transfer in",
      transactionDate: TEST_DATE,
    };

    (getOrCreateCategory as Mock)
      .mockResolvedValueOnce(TEST_CATEGORIES[0])
      .mockResolvedValueOnce(TEST_CATEGORIES[1])
      .mockResolvedValueOnce(TEST_CATEGORIES[2])
      .mockResolvedValueOnce(TEST_CATEGORIES[3])
      .mockResolvedValueOnce(TEST_CATEGORIES[4])
      .mockResolvedValueOnce(TEST_CATEGORIES[5])
      .mockResolvedValueOnce(TEST_CATEGORIES[6]);
    (randomDate as Mock).mockReturnValue(TEST_DATE);
    (randomFromSet as Mock)
      .mockReturnValueOnce("cat-food")
      .mockReturnValueOnce("cat-my-account");
    (prepareRandomStandardTransaction as Mock).mockReturnValue(standardTransaction);
    (prepareRandomTransferTransactionPair as Mock).mockReturnValue([
      transferExpense,
      transferIncome,
    ]);
    (TransactionModel.insertMany as Mock).mockResolvedValue({
      insertedIds: { 0: "id-0", 1: "id-1" },
      insertedCount: 2,
    });

    const resultPromise = createRandomTransactions(TEST_OWNER_ID, 3);
    await expect(resultPromise).rejects.toThrow(AppError);
    await expect(resultPromise).rejects.toThrow(
      "Not all provided transactions were inserted",
    );

    expect(TransactionModel.bulkWrite).not.toHaveBeenCalled();
  });

  it("throws AppError when not all expected paired transactions are updated with refId", async () => {
    const standardTransaction = {
      ownerId: TEST_OWNER_ID,
      sourceIndex: 0,
      amount: 20,
      categoryId: "cat-food",
      type: "expense",
      title: "Food expense",
      transactionDate: TEST_DATE,
    };
    const transferExpense = {
      ownerId: TEST_OWNER_ID,
      sourceIndex: 1,
      sourceRefIndex: 2,
      amount: 50,
      categoryId: "cat-my-account",
      type: "expense",
      title: "Transfer out",
      transactionDate: TEST_DATE,
    };
    const transferIncome = {
      ownerId: TEST_OWNER_ID,
      sourceIndex: 2,
      sourceRefIndex: 1,
      amount: 50,
      categoryId: "cat-my-account",
      type: "income",
      title: "Transfer in",
      transactionDate: TEST_DATE,
    };

    (getOrCreateCategory as Mock)
      .mockResolvedValueOnce(TEST_CATEGORIES[0])
      .mockResolvedValueOnce(TEST_CATEGORIES[1])
      .mockResolvedValueOnce(TEST_CATEGORIES[2])
      .mockResolvedValueOnce(TEST_CATEGORIES[3])
      .mockResolvedValueOnce(TEST_CATEGORIES[4])
      .mockResolvedValueOnce(TEST_CATEGORIES[5])
      .mockResolvedValueOnce(TEST_CATEGORIES[6]);
    (randomDate as Mock).mockReturnValue(TEST_DATE);
    (randomFromSet as Mock)
      .mockReturnValueOnce("cat-food")
      .mockReturnValueOnce("cat-my-account");
    (prepareRandomStandardTransaction as Mock).mockReturnValue(standardTransaction);
    (prepareRandomTransferTransactionPair as Mock).mockReturnValue([
      transferExpense,
      transferIncome,
    ]);
    (TransactionModel.insertMany as Mock).mockResolvedValue({
      insertedIds: { 0: "id-0", 1: "id-1", 2: "id-2" },
      insertedCount: 3,
    });
    (TransactionModel.bulkWrite as Mock).mockResolvedValue({
      modifiedCount: 1,
    });

    const resultPromise = createRandomTransactions(TEST_OWNER_ID, 3);
    await expect(resultPromise).rejects.toThrow(AppError);
    await expect(resultPromise).rejects.toThrow(
      "Not all expected transctions were updated with reference id",
    );
  });
});
