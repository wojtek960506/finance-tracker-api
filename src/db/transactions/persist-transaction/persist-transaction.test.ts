import { persistTransaction } from "./persist-transaction";
import { serializeTransaction } from "@schemas/serializers";
import { TransactionModel } from "@models/transaction-model";
import { afterEach, describe, expect, it, Mock, vi } from "vitest";
import {
  getStandardTransactionProps,
  getStandardTransactionResultJSON,
  getStandardTransactionResultSerialized,
} from "@/test-utils/factories/transaction";


vi.mock("@models/transaction-model", () => ({
  TransactionModel: { create: vi.fn() }
}));

vi.mock("@schemas/serializers", () => ({
  serializeTransaction: vi.fn(),
}))

describe("persistTransaction", async () => {
  
  const populateMock = vi.fn();

  afterEach(() => { vi.clearAllMocks() });

  const props = getStandardTransactionProps();
  const transactionJSON = getStandardTransactionResultJSON();
  const transactionSerialized = getStandardTransactionResultSerialized();

  it("transaction is persisted", async () => {
    const iTransaction = { ...transactionJSON, populate: populateMock };
    (TransactionModel.create as Mock).mockResolvedValue(iTransaction);
    (serializeTransaction as Mock).mockReturnValueOnce(transactionSerialized);

    const result = await persistTransaction(props);

    expect(TransactionModel.create).toHaveBeenCalledOnce();
    expect(TransactionModel.create).toHaveBeenCalledWith(props);
    expect(serializeTransaction).toHaveBeenCalledWith(iTransaction);
    expect(result).toEqual(transactionSerialized);
  })
});
