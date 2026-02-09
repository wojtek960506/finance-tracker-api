import { startSession } from "mongoose";
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


const withTransactionMock = vi.fn();
const endSessionMock = vi.fn();

vi.mock("mongoose", async () => {
  const actual = await vi.importActual("mongoose");

  return {
    ...actual,
    startSession: vi.fn(async () => ({
      withTransaction: withTransactionMock,
      endSession: endSessionMock,
    }))
  }
});

vi.mock("@models/transaction-model", () => ({
  TransactionModel: {
    create: vi.fn(),
    findOneAndUpdate: vi.fn(),
  }
}));

vi.mock("@schemas/serializers", () => ({
  serializeTransaction: vi.fn(),
}))

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

  it("2 transactions are created and updated when no errors", async () => {
    withTransactionMock.mockImplementation(async (fn) => {
      await fn(); //simulate transaction body execution
    });
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

    expect(startSession).toHaveBeenCalled();
    expect(withTransactionMock).toHaveBeenCalledOnce();
    expect(endSessionMock).toHaveBeenCalledOnce();
    expect(TransactionModel.create).toHaveBeenCalledOnce();
    expect(TransactionModel.findOneAndUpdate).toHaveBeenCalledTimes(2);
    expect(TransactionModel.create).toHaveBeenCalledWith(
      [expenseProps, incomeProps],
      { 
        session: { endSession: endSessionMock, withTransaction: withTransactionMock},
        ordered: true
      }
    );
    expect(TransactionModel.findOneAndUpdate).toHaveBeenNthCalledWith(
      1,
      { _id: EXCHANGE_TXN_EXPENSE_ID_OBJ },
      { refId: EXCHANGE_TXN_INCOME_ID_OBJ },
      { 
        session: { endSession: endSessionMock, withTransaction: withTransactionMock},
        new: true
      }
    );
    expect(TransactionModel.findOneAndUpdate).toHaveBeenNthCalledWith(
      2,
      { _id: EXCHANGE_TXN_INCOME_ID_OBJ },
      { refId: EXCHANGE_TXN_EXPENSE_ID_OBJ },
      { 
        session: { endSession: endSessionMock, withTransaction: withTransactionMock},
        new: true
      }
    );
    expect(result).toEqual([ expenseTransactionSerialized, incomeTransactionSerialized ]);
  })

  it("end session even when the error is thrown within `withTransaction`", async () => {
    withTransactionMock.mockImplementationOnce(async () => {
      throw new Error("fails");
    });

    await expect(persistTransactionPair(expenseProps, incomeProps)).rejects.toThrow();

    expect(endSessionMock).toHaveBeenCalledOnce();
    expect(withTransactionMock).toHaveBeenCalledOnce();
    expect(TransactionModel.create).not.toHaveBeenCalled();
  })
});
