

import { describe, expect, it, Mock, vi } from "vitest";
import { getUpdatedTransaction } from "@utils/routes";
import { Transaction } from "@models/Transaction";

vi.mock("@models/Transaction", () => ({
  Transaction: {
    findByIdAndUpdate: vi.fn()
  }
}));

describe("getUpdatedTransaction", () => {

  const id = "1"
  const fullBody = {
    "date": new Date("2025-01-01"),
    "description": "some desc",
    "amount": 1.11,
    "currency": "PLN",
    "category": "transport",
    "transactionType": "expense" as any,
    "paymentMethod": "card" as any,
    "account": "someBank"
  }
  const partialBody = { amount: 7.77 }


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