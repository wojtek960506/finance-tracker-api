import { startSession } from "mongoose";
import { randomObjectIdString } from "@utils/random";
import { TransactionModel } from "@models/transaction-model";
import { afterEach, describe, expect, it, Mock, vi } from "vitest";
import { serializeTransaction } from "@schemas/serialize-transaction";
import { createTransferTransaction } from "./create-transfer-transaction";
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

describe("createTransferTransaction", async () => {
  const FROM_ID = randomObjectIdString();
  const TO_ID = randomObjectIdString();
  const OWNER_ID = randomObjectIdString();
  const FROM_SOURCE_IDX = 1;
  const TO_SOURCE_IDX = 2;
  const {
    fromProps,
    toProps,
  } = getTransferTransactionProps(OWNER_ID, FROM_SOURCE_IDX, TO_SOURCE_IDX);
  const fromTransaction = { ...fromProps, id: FROM_ID, refId: TO_ID };
  const toTransaction = { ...toProps, id: TO_ID, refId: FROM_ID };

  afterEach(() => { vi.clearAllMocks() });

  it("2 transactions are created and updated when no errors", async () => {
    withTransactionMock.mockImplementation(async (fn) => {
      await fn(); //simulate transaction body execution
    });
    (TransactionModel.create as Mock).mockResolvedValue([
      { _id: FROM_ID },
      { _id: TO_ID },
    ]);
    (TransactionModel.findOneAndUpdate as Mock)
      .mockResolvedValueOnce(fromTransaction)
      .mockResolvedValueOnce(toTransaction);
    (serializeTransaction as Mock)
      .mockReturnValueOnce(fromTransaction)
      .mockReturnValueOnce(toTransaction);

    const result = await createTransferTransaction(fromProps, toProps);

    expect(startSession).toHaveBeenCalled();
    expect(withTransactionMock).toHaveBeenCalledOnce();
    expect(endSessionMock).toHaveBeenCalledOnce();
    expect(TransactionModel.create).toHaveBeenCalledOnce();
    expect(TransactionModel.findOneAndUpdate).toHaveBeenCalledTimes(2);
    expect(TransactionModel.create).toHaveBeenCalledWith(
      [fromProps, toProps],
      { 
        session: { endSession: endSessionMock, withTransaction: withTransactionMock},
        ordered: true
      }
    );
    expect(TransactionModel.findOneAndUpdate).toHaveBeenNthCalledWith(
      1,
      { _id: FROM_ID },
      { refId: TO_ID },
      { 
        session: { endSession: endSessionMock, withTransaction: withTransactionMock},
        new: true
      }
    );
    expect(TransactionModel.findOneAndUpdate).toHaveBeenNthCalledWith(
      2,
      { _id: TO_ID },
      { refId: FROM_ID },
      { 
        session: { endSession: endSessionMock, withTransaction: withTransactionMock},
        new: true
      }
    );
    expect(result).toEqual([fromTransaction, toTransaction]);
  })

  it("end session even when the error is thrown within `withTransaction`", async () => {
    withTransactionMock.mockImplementationOnce(async () => {
      throw new Error("fails");
    });

    await expect(createTransferTransaction(fromProps, toProps)).rejects.toThrow();

    expect(endSessionMock).toHaveBeenCalledOnce();
    expect(withTransactionMock).toHaveBeenCalledOnce();
    expect(TransactionModel.create).not.toHaveBeenCalled();
  })
})