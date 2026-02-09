import { NotFoundError } from "@utils/errors";
import { removeTransaction } from "./remove-transaction";
import { TransactionModel } from "@models/transaction-model";
import { afterEach, describe, expect, it, Mock, vi } from "vitest";
import {
  getStandardTransactionResultSerialized,
  getTransferTransactionResultSerialized,
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
vi.mock("@models/transaction-model", () => ({ TransactionModel: { deleteMany: vi.fn() } }));

describe("removeTransaction", () => {
  const standard = getStandardTransactionResultSerialized();
  const { expenseTransactionSerialized: transfer } = getTransferTransactionResultSerialized();
  const resultOne = { acknowledged: true, deletedCount: 1 };
  const resultTwo = { ...resultOne, deletedCount: 2 };

  afterEach(() => { vi.clearAllMocks() });

  withTransactionMock.mockImplementation(async (fn) => { await fn() });

  it.each([
    ["without", resultOne, standard.id, undefined, [standard.id]],
    ["with", resultTwo, transfer.id, transfer.refId, [transfer.id, transfer.refId]]
  ])(
    "remove transaction %d reference",
    async (_, expectedResult, transactionId, transactionRefId, expectedIds) => {
    (TransactionModel.deleteMany as Mock).mockResolvedValue(expectedResult);


    const result = await removeTransaction(transactionId, transactionRefId);

    expect(endSessionMock).toHaveBeenCalledOnce();
    expect(withTransactionMock).toHaveBeenCalledOnce();
    expect(TransactionModel.deleteMany).toHaveBeenCalledOnce();
    expect(TransactionModel.deleteMany).toHaveBeenCalledWith(
      { _id: { $in: expectedIds }},
      expect.anything()
    );
    expect(result).toEqual(expectedResult);
  })

  it("throws when removed not as much as provided but still end session", async () => {
    (TransactionModel.deleteMany as Mock).mockResolvedValue(resultTwo);

    await expect(removeTransaction(transfer.id)).rejects.toThrow(NotFoundError);

    expect(endSessionMock).toHaveBeenCalledOnce();
    expect(withTransactionMock).toHaveBeenCalledOnce();
    expect(TransactionModel.deleteMany).toHaveBeenCalledOnce();
  });
});
