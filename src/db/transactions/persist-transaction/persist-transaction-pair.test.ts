import { withSession } from "@utils/with-session";
import { serializeTransaction } from "@schemas/serializers";
import { TransactionModel } from "@models/transaction-model";
import { afterEach, describe, expect, it, Mock, vi } from "vitest";
import { persistTransactionPair } from "./persist-transaction-pair";
import {
  EXCHANGE_TXN_INCOME_ID_OBJ,
  EXCHANGE_TXN_EXPENSE_ID_OBJ,
  getExchangeTransactionProps,
  getExchangeTransactionResultJSON,
  getExchangeTransactionResultSerialized,
} from "@/test-utils/factories/transaction";


vi.mock("@utils/with-session", () => ({ withSession: vi.fn() }));

vi.mock("@models/transaction-model", () => ({
  TransactionModel: { create: vi.fn(), findOneAndUpdate: vi.fn() }
}));

vi.mock("@schemas/serializers", () => ({ serializeTransaction: vi.fn() }));

describe("createTransactionPair", async () => {
  const {
    incomeProps,
    expenseProps,
  } = getExchangeTransactionProps(true);

  const {
    incomeTransactionJSON,
    expenseTransactionJSON,
  } = getExchangeTransactionResultJSON();

  const {
    incomeTransactionSerialized,
    expenseTransactionSerialized,
  } = getExchangeTransactionResultSerialized();

  afterEach(() => { vi.clearAllMocks() });

  it("throws error when result is undefined", async () => {
    (withSession as Mock).mockImplementation(async () => { return undefined });

    await expect(
      persistTransactionPair(expect.anything(), expect.anything())
    ).rejects.toThrow(Error);
  });

  it("2 transactions are created and updated", async () => {
    (withSession as Mock).mockImplementation(
    async (func, ...args) => { return await func({}, ...args) }
  ),
    (TransactionModel.create as Mock).mockResolvedValue([
      { _id: EXCHANGE_TXN_EXPENSE_ID_OBJ },
      { _id: EXCHANGE_TXN_INCOME_ID_OBJ },
    ]);

    const mockQuery1 = { populate: vi.fn().mockResolvedValue(expenseTransactionJSON) };
    const mockQuery2 = { populate: vi.fn().mockResolvedValue(incomeTransactionJSON) };

    (TransactionModel.findOneAndUpdate as Mock)
      .mockReturnValueOnce(mockQuery1)
      .mockReturnValueOnce(mockQuery2);
    (serializeTransaction as Mock)
      .mockReturnValueOnce(expenseTransactionSerialized)
      .mockReturnValueOnce(incomeTransactionSerialized);

    const result = await persistTransactionPair(expenseProps, incomeProps);

    expect(TransactionModel.create).toHaveBeenCalledOnce();
    expect(TransactionModel.findOneAndUpdate).toHaveBeenCalledTimes(2);
    expect(TransactionModel.create).toHaveBeenCalledWith(
      [expenseProps, incomeProps],
      { session: expect.anything(), ordered: true },
    );
    expect(TransactionModel.findOneAndUpdate).toHaveBeenNthCalledWith(
      1,
      { _id: EXCHANGE_TXN_EXPENSE_ID_OBJ },
      { refId: EXCHANGE_TXN_INCOME_ID_OBJ },
      { session: expect.anything(), new: true },
    );
    expect(TransactionModel.findOneAndUpdate).toHaveBeenNthCalledWith(
      2,
      { _id: EXCHANGE_TXN_INCOME_ID_OBJ },
      { refId: EXCHANGE_TXN_EXPENSE_ID_OBJ },
      { session: expect.anything(), new: true },
    );
    expect(withSession).toHaveBeenCalledOnce();
    expect(result).toEqual([ expenseTransactionSerialized, incomeTransactionSerialized ]);
  });

  
});
