import { randomObjectIdString } from "@utils/random";
import { TransactionModel } from "@models/transaction-model";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";
import { serializeTransaction } from "@schemas/serialize-transaction";
import { createStandardTransaction } from "./create-standard-transaction";
import { generateFullStandardTransaction } from "@utils/__mocks__/transactionMock";


vi.mock("@models/transaction-model", () => ({
  TransactionModel: {
    create: vi.fn(),
  }
}));


vi.mock("@schemas/serialize-transaction", () => ({
  serializeTransaction: vi.fn()
}));

describe("createStandardTransaction", async () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("creates standard transactions", async () => {
    const ID = randomObjectIdString();
    const OWNER_ID = randomObjectIdString();
    const SOURCE_INDEX = 1;
    const createDTO = generateFullStandardTransaction();
    const createBody = { ...createDTO, sourceIndex: SOURCE_INDEX, ownerId: OWNER_ID };
    const newTransaction = { ...createBody, id: ID };
    (TransactionModel.create as Mock).mockResolvedValue(newTransaction);
    (serializeTransaction as Mock).mockReturnValue(newTransaction);

    const result = await createStandardTransaction(createDTO, OWNER_ID, SOURCE_INDEX);
    
    expect(TransactionModel.create).toHaveBeenCalledTimes(1);
    expect(TransactionModel.create).toHaveBeenCalledWith(createBody);
    expect(result).toEqual(newTransaction);
  });
})