import { NotFoundError } from "@utils/errors";
import { randomObjectIdString } from "@utils/random";
import { removeTransaction } from "./remove-transaction";
import { TransactionModel } from "@models/transaction-model";
import { afterEach, describe, expect, it, Mock, vi } from "vitest";
import {
  getStandardTransactionResultJSON,
  getTransferTransactionResultJSON,
} from "@/test-utils/mocks/transactions";


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
  const [E_ID, I_ID] = [randomObjectIdString(), randomObjectIdString()];
  const OWNER_ID = randomObjectIdString();
  const [E_SRC_IDX, I_SRC_IDX] = [1, 2];
  const [transfer] = getTransferTransactionResultJSON(OWNER_ID, E_SRC_IDX, I_SRC_IDX, E_ID, I_ID);
  const standard = getStandardTransactionResultJSON(OWNER_ID, E_SRC_IDX, E_ID);
  const RESULT_ONE = { acknowledged: true, deletedCount: 1 };
  const RESULT_TWO = { ...RESULT_ONE, deletedCount: 2 };

  afterEach(() => { vi.clearAllMocks() });

  withTransactionMock.mockImplementation(async (fn) => { await fn() });

  it.each([
    ["without", RESULT_ONE, standard.id, undefined, [standard.id]],
    ["with", RESULT_TWO, transfer.id, transfer.refId, [transfer.id, transfer.refId]]
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
    (TransactionModel.deleteMany as Mock).mockResolvedValue(RESULT_TWO);

    await expect(removeTransaction(transfer.id)).rejects.toThrow(NotFoundError);

    expect(endSessionMock).toHaveBeenCalledOnce();
    expect(withTransactionMock).toHaveBeenCalledOnce();
    expect(TransactionModel.deleteMany).toHaveBeenCalledOnce();
  })

})