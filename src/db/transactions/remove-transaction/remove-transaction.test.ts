import { removeTransaction } from "./remove-transaction";
import { TransactionModel } from "@models/transaction-model";
import { afterEach, describe, expect, it, Mock, vi } from "vitest";
import {
  getStandardTransactionResultSerialized,
  getTransferTransactionResultSerialized,
} from "@/test-utils/factories/transaction";


vi.mock("@utils/with-session", () => ({
  withSession: vi.fn().mockImplementation(
    async (func, ...args) => { return await func({}, ...args) }
  ),
}));

vi.mock("@models/transaction-model", () => ({ TransactionModel: { deleteMany: vi.fn() } }));

describe("removeTransaction", () => {
  const standard = getStandardTransactionResultSerialized();
  const { expenseTransactionSerialized: transfer } = getTransferTransactionResultSerialized();
  const resultOne = { acknowledged: true, deletedCount: 1 };
  const resultTwo = { ...resultOne, deletedCount: 2 };

  afterEach(() => { vi.clearAllMocks() });

  it.each([
    ["without", resultOne, standard.id, undefined, [standard.id]],
    ["with", resultTwo, transfer.id, transfer.refId, [transfer.id, transfer.refId]]
  ])(
    "remove transaction %d reference",
    async (_, expectedResult, transactionId, transactionRefId, expectedIds) => {
    (TransactionModel.deleteMany as Mock).mockResolvedValue(expectedResult);


    const result = await removeTransaction(transactionId, transactionRefId);

    expect(TransactionModel.deleteMany).toHaveBeenCalledOnce();
    expect(TransactionModel.deleteMany).toHaveBeenCalledWith(
      { _id: { $in: expectedIds }},
      expect.anything()
    );
    expect(result).toEqual(expectedResult);
  })
});
