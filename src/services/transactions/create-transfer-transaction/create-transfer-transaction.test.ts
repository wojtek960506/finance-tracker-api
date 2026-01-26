import { randomObjectIdString } from "@utils/random";
import { describe, expect, it, Mock, vi } from "vitest";
import { getNextSourceIndex } from "../get-next-source-index";
import { createTransferTransaction } from "./create-transfer-transaction";
import { persistTransferTransaction } from "@db/transactions/persist-transaction";
import {
  getTransactionCreateTransferDTO,
  getTransferTransactionResultJSON,
} from "@/test-utils/mocks/transactions";


vi.mock("@services/transactions/get-next-source-index", () => ({
  getNextSourceIndex: vi.fn(),
}));

vi.mock("@db/transactions/persist-transaction/persist-transaction", () => ({
  persistTransferTransaction: vi.fn(),
}));

describe("createTransferTransaction", async () => {
  it("should create transfer transaction", async () => {
    const [EXPENSE_SOURCE_INDEX, INCOME_SOURCE_INDEX] = [1,2];
    const [EXPENSE_ID, INCOME_ID] = [randomObjectIdString(), randomObjectIdString()];
    const USER_ID = randomObjectIdString();  
    const dto = getTransactionCreateTransferDTO();
    const [expenseTransaction, incomeTransaction] = getTransferTransactionResultJSON(
      USER_ID, EXPENSE_SOURCE_INDEX, INCOME_SOURCE_INDEX, EXPENSE_ID, INCOME_ID
    );
    (persistTransferTransaction as Mock).mockResolvedValue(
      [expenseTransaction, incomeTransaction]
    );
    (getNextSourceIndex as Mock)
      .mockResolvedValueOnce(EXPENSE_SOURCE_INDEX)
      .mockResolvedValueOnce(INCOME_SOURCE_INDEX);
    
    const result = await createTransferTransaction(dto, USER_ID);

    expect(persistTransferTransaction).toHaveBeenCalledOnce();
    expect(getNextSourceIndex).toHaveBeenCalledTimes(2);
    expect(getNextSourceIndex).toHaveBeenNthCalledWith(1, USER_ID);
    expect(getNextSourceIndex).toHaveBeenNthCalledWith(2, USER_ID);
    expect(result).toEqual([expenseTransaction, incomeTransaction]);
  })
})