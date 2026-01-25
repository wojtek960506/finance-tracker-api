import { randomObjectIdString } from "@utils/random";
import { TransactionModel } from "@models/transaction-model";
import { afterEach, describe, expect, it, Mock, vi } from "vitest";
import { persistStandardTransaction } from "./persist-transaction";
import { serializeTransaction } from "@schemas/serialize-transaction";
import { getStandardTransactionProps } from "@/test-utils/mocks/transactions";


vi.mock("@models/transaction-model", () => ({
  TransactionModel: { create: vi.fn() }
}));

vi.mock("@schemas/serialize-transaction", () => ({
  serializeTransaction: vi.fn(),
}))

describe("persistTransaction", async () => {
  const [ID, SOURCE_INDEX] = [randomObjectIdString(), 1];
  const OWNER_ID = randomObjectIdString();
  
  afterEach(() => { vi.clearAllMocks() });

  it("transaction is persisted", async () => {
    const props = getStandardTransactionProps(OWNER_ID, SOURCE_INDEX);
    const transaction = { ...props, id: ID };
    (TransactionModel.create as Mock).mockResolvedValue(transaction);
    (serializeTransaction as Mock)
      .mockReturnValueOnce(transaction)

    const result = await persistStandardTransaction(props);

    expect(TransactionModel.create).toHaveBeenCalledOnce();
    expect(TransactionModel.create).toHaveBeenCalledWith(props);
    expect(serializeTransaction).toHaveBeenCalledWith(transaction);
    expect(result).toEqual(transaction);
  })
})