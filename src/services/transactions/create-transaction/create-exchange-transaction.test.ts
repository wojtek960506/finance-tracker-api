import { randomObjectIdString } from "@utils/random";
import { describe, expect, it, Mock, vi } from "vitest";
import { createExchangeTransaction } from "./create-exchange-transaction";
import { getNextSourceIndex } from "@services/transactions/get-next-source-index";
import {
  getTransactionCreateExchangeDTO,
  getExchangeTransactionResultJSON,
} from "@/test-utils/mocks/transactions";
import { persistTransactionPair } from "@db/transactions";


vi.mock("@services/transactions/get-next-source-index", () => ({
  getNextSourceIndex: vi.fn(),
}));

vi.mock("@db/transactions/persist-transaction/persist-transaction-pair", () => ({
  persistTransactionPair: vi.fn(),
}));

describe("createExchangeTransaction", async () => {
  it("should create exchange transaction", async () => {
    const [EXPENSE_SOURCE_INDEX,INCOME_SOURCE_INDEX] = [1,2];
    const [EXPENSE_ID, INCOME_ID] = [randomObjectIdString(), randomObjectIdString()];
    const USER_ID = randomObjectIdString();  
    const dto = getTransactionCreateExchangeDTO();
    const [expenseTransaction, incomeTransaction] = getExchangeTransactionResultJSON(
      USER_ID, EXPENSE_SOURCE_INDEX, INCOME_SOURCE_INDEX, EXPENSE_ID, INCOME_ID
    );
    (persistTransactionPair as Mock).mockResolvedValue(
      [expenseTransaction, incomeTransaction]
    );
    (getNextSourceIndex as Mock)
      .mockResolvedValueOnce(EXPENSE_SOURCE_INDEX)
      .mockResolvedValueOnce(INCOME_SOURCE_INDEX);
    
    const result = await createExchangeTransaction(dto, USER_ID);

    expect(persistTransactionPair).toHaveBeenCalledOnce();
    expect(getNextSourceIndex).toHaveBeenCalledTimes(2);
    expect(getNextSourceIndex).toHaveBeenNthCalledWith(1, USER_ID);
    expect(getNextSourceIndex).toHaveBeenNthCalledWith(2, USER_ID);
    expect(result).toEqual([expenseTransaction, incomeTransaction]);
  })
})