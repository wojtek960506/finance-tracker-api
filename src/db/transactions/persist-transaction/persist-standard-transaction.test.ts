import { randomObjectIdString } from "@utils/random";
import { TransactionModel } from "@models/transaction-model";
import { afterEach, describe, expect, it, Mock, vi } from "vitest";
import { serializeTransaction } from "@schemas/serialize-transaction";
import { persistStandardTransaction } from "./persist-standard-transaction";
import { getStandardTransactionProps } from "@utils/__mocks__/transactions/create-standard";


vi.mock("@models/transaction-model", () => ({
  TransactionModel: { create: vi.fn() }
}));

vi.mock("@schemas/serialize-transaction", () => ({
  serializeTransaction: vi.fn(),
}))

describe("createStandardTransaction", async () => {
  const ID = randomObjectIdString();
  const OWNER_ID = randomObjectIdString();
  const SOURCE_INDEX = 1;
  const props = getStandardTransactionProps(OWNER_ID, SOURCE_INDEX);
  const transaction = { ...props, id: ID };

  afterEach(() => { vi.clearAllMocks() });

  it("standard transaction is created", async () => {
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