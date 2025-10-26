

import { beforeEach, describe, expect, it, Mock, vi } from "vitest";
import { getUpdatedTransaction, updateTransactionHelper } from "@utils/routes";
import { Transaction } from "@models/Transaction";
import { generateFullTransaction, generatePartialTransaction } from "./__mocks__/transactionMock";

vi.mock("@models/Transaction", () => ({
  Transaction: {
    findByIdAndUpdate: vi.fn()
  }
}));

const id = "1";
const fullBody = generateFullTransaction();
const partialBody = generatePartialTransaction();

describe("getUpdatedTransaction", () => {

  beforeEach(() => { vi.clearAllMocks() })

  it("should handle partial update when `isFullUpdate = false`", async () => {
    const updatedTransaction = { _id: id, ...fullBody, ...partialBody };
    (Transaction.findByIdAndUpdate as Mock).mockResolvedValue(updatedTransaction);

    const updated = await getUpdatedTransaction(id, partialBody, false);
    expect(updated).toEqual(updatedTransaction);
    expect(Transaction.findByIdAndUpdate).toHaveBeenCalledWith(
      id, { $set: partialBody}, { new: true }
    )
  })

  it("should handle full update when `isFullUpdate = true`", async () => {
    const updatedTransaction = { _id: id, ...fullBody };
    (Transaction.findByIdAndUpdate as Mock).mockResolvedValue(updatedTransaction);

    const updated = await getUpdatedTransaction(id, fullBody, true);
    expect(updated).toEqual(updatedTransaction);
    expect(Transaction.findByIdAndUpdate).toHaveBeenCalledWith(
      id, fullBody, { new: true }
    )
  })

  it("should return null when document not found", async () => {
    (Transaction.findByIdAndUpdate as Mock).mockResolvedValue(undefined);

    const result = await getUpdatedTransaction(id, fullBody, true);
    expect(result).toBeUndefined();
    expect(Transaction.findByIdAndUpdate).toHaveBeenCalledWith(
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
    (Transaction.findByIdAndUpdate as Mock).mockResolvedValue({ ...fullBody })

    await updateTransactionHelper(req as any, res as any, true);

    expect(res.code).not.toHaveBeenCalled();
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith({ message: expect.any(String), data: { ...fullBody } })
  })

  it ("when some problem with update it should set code to 404", async () => {
    (Transaction.findByIdAndUpdate as Mock).mockResolvedValue(undefined);
    
    await updateTransactionHelper(req as any, res as any, true);

    expect(res.code).toHaveBeenCalledTimes(1);
    expect(res.code).toHaveBeenCalledWith(404);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith({ message: expect.any(String) });
  })

})