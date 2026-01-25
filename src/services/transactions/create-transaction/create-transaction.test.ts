import { randomObjectIdString } from "@utils/random";
import { getNextSourceIndex } from "@services/transactions";
import { afterEach, describe, expect, it, Mock, vi } from "vitest";
import { persistTransaction, persistTransactionPair } from "@db/transactions";
import {
  createStandardTransaction,
  createExchangeTransaction,
  createTransferTransaction,
} from "./create-transaction";
import {
  getTransactionCreateStandardDTO,
  getTransactionCreateExchangeDTO,
  getTransactionCreateTransferDTO,
  getStandardTransactionResultJSON,
  getExchangeTransactionResultJSON,  
  getTransferTransactionResultJSON,
} from "@/test-utils/mocks/transactions";


vi.mock("@services/transactions/get-next-source-index", () => ({
  getNextSourceIndex: vi.fn(),
}));

vi.mock("@db/transactions/persist-transaction/persist-transaction", () => ({
  persistTransaction: vi.fn(),
}));

vi.mock("@db/transactions/persist-transaction/persist-transaction-pair", () => ({
  persistTransactionPair: vi.fn(),
}));

describe("createStandardTransaction", async () => {

  const [EXPENSE_ID, INCOME_ID] = [randomObjectIdString(), randomObjectIdString()];
  const [EXPENSE_SOURCE_INDEX,INCOME_SOURCE_INDEX] = [1,2];
  const OWNER_ID = randomObjectIdString();

  afterEach(() => { vi.clearAllMocks() });

  it("should create standard transaction", async () => {
    const dto = getTransactionCreateStandardDTO();
    const transaction = getStandardTransactionResultJSON(
      OWNER_ID, EXPENSE_SOURCE_INDEX, EXPENSE_ID
    );
    (persistTransaction as Mock).mockResolvedValue(transaction);
    (getNextSourceIndex as Mock).mockResolvedValue(EXPENSE_SOURCE_INDEX);

    const result = await createStandardTransaction(dto, OWNER_ID);

    expect(persistTransaction).toHaveBeenCalledOnce();
    expect(getNextSourceIndex).toHaveBeenCalledOnce();
    expect(getNextSourceIndex).toHaveBeenCalledWith(OWNER_ID);
    expect(result).toEqual(transaction);
  });

  it("should create exchange transaction", async () => {
    const dto = getTransactionCreateExchangeDTO();
    const expectedResult = getExchangeTransactionResultJSON(
      OWNER_ID, EXPENSE_SOURCE_INDEX, INCOME_SOURCE_INDEX, EXPENSE_ID, INCOME_ID
    );
    (persistTransactionPair as Mock).mockResolvedValue(expectedResult);
    (getNextSourceIndex as Mock)
      .mockResolvedValueOnce(EXPENSE_SOURCE_INDEX)
      .mockResolvedValueOnce(INCOME_SOURCE_INDEX);
    
    const result = await createExchangeTransaction(dto, OWNER_ID);

    expect(persistTransactionPair).toHaveBeenCalledOnce();
    expect(getNextSourceIndex).toHaveBeenCalledTimes(2);
    expect(getNextSourceIndex).toHaveBeenNthCalledWith(1, OWNER_ID);
    expect(getNextSourceIndex).toHaveBeenNthCalledWith(2, OWNER_ID);
    expect(result).toEqual(expectedResult);
  });

  it("should create transfer transaction", async () => {
    const dto = getTransactionCreateTransferDTO();
    const expectedResult = getTransferTransactionResultJSON(
      OWNER_ID, EXPENSE_SOURCE_INDEX, INCOME_SOURCE_INDEX, EXPENSE_ID, INCOME_ID
    );
    (persistTransactionPair as Mock).mockResolvedValue(expectedResult);
    (getNextSourceIndex as Mock)
      .mockResolvedValueOnce(EXPENSE_SOURCE_INDEX)
      .mockResolvedValueOnce(INCOME_SOURCE_INDEX);
    
    const result = await createTransferTransaction(dto, OWNER_ID);

    expect(persistTransactionPair).toHaveBeenCalledOnce();
    expect(getNextSourceIndex).toHaveBeenCalledTimes(2);
    expect(getNextSourceIndex).toHaveBeenNthCalledWith(1, OWNER_ID);
    expect(getNextSourceIndex).toHaveBeenNthCalledWith(2, OWNER_ID);
    expect(result).toEqual(expectedResult);
  });
})