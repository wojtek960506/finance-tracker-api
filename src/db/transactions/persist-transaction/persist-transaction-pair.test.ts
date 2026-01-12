import { startSession } from "mongoose";
import { randomObjectIdString } from "@utils/random";
import { TransactionModel } from "@models/transaction-model";
import { afterEach, describe, expect, it, Mock, vi } from "vitest";
import { persistTransactionPair } from "./persist-transaction-pair";
import { serializeTransaction } from "@schemas/serialize-transaction";
import { getTransferTransactionProps } from "@utils/__mocks__/transactions/create-transfer";


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

vi.mock("@schemas/serialize-transaction", () => ({
  serializeTransaction: vi.fn(),
}))

describe("createTransactionPair", async () => {
  const EXPENSE_ID = randomObjectIdString();
  const INCOME_ID = randomObjectIdString();
  const OWNER_ID = randomObjectIdString();
  const EXPENSE_SOURCE_IDX = 1;
  const INCOME_SOURCE_IDX = 2;
  const {
    expenseProps,
    incomeProps,
  } = getTransferTransactionProps(OWNER_ID, EXPENSE_SOURCE_IDX, INCOME_SOURCE_IDX);
  const expenseTransaction = { ...expenseProps, id: EXPENSE_ID, refId: INCOME_ID };
  const incomeTransaction = { ...incomeProps, id: INCOME_ID, refId: EXPENSE_ID };

  afterEach(() => { vi.clearAllMocks() });

  it("2 transactions are created and updated when no errors", async () => {
    withTransactionMock.mockImplementation(async (fn) => {
      await fn(); //simulate transaction body execution
    });
    (TransactionModel.create as Mock).mockResolvedValue([
      { _id: EXPENSE_ID },
      { _id: INCOME_ID },
    ]);
    (TransactionModel.findOneAndUpdate as Mock)
      .mockResolvedValueOnce(expenseTransaction)
      .mockResolvedValueOnce(incomeTransaction);
    (serializeTransaction as Mock)
      .mockReturnValueOnce(expenseTransaction)
      .mockReturnValueOnce(incomeTransaction);

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
      { _id: EXPENSE_ID },
      { refId: INCOME_ID },
      { 
        session: { endSession: endSessionMock, withTransaction: withTransactionMock},
        new: true
      }
    );
    expect(TransactionModel.findOneAndUpdate).toHaveBeenNthCalledWith(
      2,
      { _id: INCOME_ID },
      { refId: EXPENSE_ID },
      { 
        session: { endSession: endSessionMock, withTransaction: withTransactionMock},
        new: true
      }
    );
    expect(result).toEqual([expenseTransaction, incomeTransaction]);
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
})