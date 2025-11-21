

import { beforeEach, describe, expect, it, Mock, vi } from "vitest";
import { getUpdatedTransaction, updateTransactionHelper } from "@utils/routes";
import { TransactionModel } from "@models/transaction-model";
import { generateFullTransaction, generatePartialTransaction } from "./__mocks__/transactionMock";
import { NotFoundError } from "./errors";
import { serializeTransaction } from "@schemas/serialize-transaction";

vi.mock("@models/transaction-model", () => ({
  TransactionModel: {
    findByIdAndUpdate: vi.fn()
  }
}));

vi.mock("@schemas/serialize-transaction", () => ({
  serializeTransaction: vi.fn()
}));

const id = "1";
const fullBody = generateFullTransaction();
const partialBody = generatePartialTransaction();

describe("getUpdatedTransaction", () => {

  beforeEach(() => { vi.clearAllMocks() })

  it("should handle partial update when `isFullUpdate = false`", async () => {
    const updatedTransaction = { _id: id, ...fullBody, ...partialBody };
    (TransactionModel.findByIdAndUpdate as Mock).mockResolvedValue(updatedTransaction);

    const updated = await getUpdatedTransaction(id, partialBody, false);
    expect(updated).toEqual(updatedTransaction);
    expect(TransactionModel.findByIdAndUpdate).toHaveBeenCalledWith(
      id, { $set: partialBody}, { new: true }
    )
  })

  it("should handle full update when `isFullUpdate = true`", async () => {
    const updatedTransaction = { _id: id, ...fullBody };
    (TransactionModel.findByIdAndUpdate as Mock).mockResolvedValue(updatedTransaction);

    const updated = await getUpdatedTransaction(id, fullBody, true);
    expect(updated).toEqual(updatedTransaction);
    expect(TransactionModel.findByIdAndUpdate).toHaveBeenCalledWith(
      id, fullBody, { new: true }
    )
  })

  it("should return null when document not found", async () => {
    (TransactionModel.findByIdAndUpdate as Mock).mockResolvedValue(undefined);

    const result = await getUpdatedTransaction(id, fullBody, true);
    expect(result).toBeUndefined();
    expect(TransactionModel.findByIdAndUpdate).toHaveBeenCalledWith(
      id, fullBody, { new: true }
    )
  })  
})

describe("updateTransactionHelper", () => {
  const req = { params: { id }, body: fullBody }
  const send = vi.fn();
  const res = { send, code: vi.fn(() => ({ send })) }
  
  beforeEach(() => { vi.clearAllMocks() })

  it("when properly updated it shoud send updated data", async () => {
    (TransactionModel.findByIdAndUpdate as Mock).mockResolvedValue({ ...fullBody });
    (serializeTransaction as Mock).mockReturnValue({ ...fullBody });

    await updateTransactionHelper(req as any, res as any, true);

    expect(res.code).not.toHaveBeenCalled();
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith({ ...fullBody })
  })

  it ("when some problem with update it should throw an error", async () => {
    (TransactionModel.findByIdAndUpdate as Mock).mockResolvedValue(undefined);
    
    await expect(updateTransactionHelper(req as any, res as any, true))
      .rejects
      .toThrow(NotFoundError);

    try {
      await updateTransactionHelper(req as any, res as any, true);
      throw new Error("Expected `updateTransactionHelper` to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundError);
      expect((error as NotFoundError).statusCode).toBe(404);
      expect(error).toHaveProperty("message");
    }
  })

})