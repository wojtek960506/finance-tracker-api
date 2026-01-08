import { CounterModel } from "@models/counter-model";
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

vi.mock("@models/counter-model", () => ({
  CounterModel: {
    findOneAndUpdate: vi.fn(),
  } 
}));

vi.mock("@schemas/serialize-transaction", () => ({
  serializeTransaction: vi.fn()
}));

describe("createStandardTransaction", async () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("creates standard transactions", async () => {
    const id = randomObjectIdString();
    const ownerId = randomObjectIdString();
    const sourceIndex = "1";
    const createDTO = generateFullStandardTransaction();
    const newTransaction = {
      ...createDTO,
      sourceIndex,
      ownerId,
      id,
    };
    (TransactionModel.create as Mock).mockResolvedValue(newTransaction);
    (CounterModel.findOneAndUpdate as Mock).mockResolvedValue({ seq: sourceIndex });
    (serializeTransaction as Mock).mockReturnValue(newTransaction)

    const result = await createStandardTransaction(createDTO, ownerId);
    
    expect(TransactionModel.create).toHaveBeenCalledTimes(1);
    expect(CounterModel.findOneAndUpdate).toHaveBeenCalledTimes(1);
    expect(result).toEqual(newTransaction);
  });
})