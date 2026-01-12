import { randomObjectIdString } from "@utils/random";
import { describe, expect, it, Mock, vi } from "vitest";
import { createTransactionPair } from "../create-transaction-pair";
import { createTransferTransaction } from "./create-transfer-transaction";
import { getTransferTransactionProps } from "@utils/__mocks__/transactions/create-transfer";


vi.mock("@services/transactions/create-transaction-pair", () => ({
  createTransactionPair: vi.fn(),
}));

describe("createTransferTransaction", async () => {
  const EXPENSE_ID = randomObjectIdString();
  const INCOME_ID = randomObjectIdString();
  const {
    expenseProps,
    incomeProps,
  } = getTransferTransactionProps(randomObjectIdString(), 1, 2);
  const expenseTransaction = { ...expenseProps, id: EXPENSE_ID, refId: INCOME_ID };
  const incomeTransaction = { ...incomeProps, id: INCOME_ID, refId: EXPENSE_ID };
  
  it("create pair for transfer transaction", async () => {
    (createTransactionPair as Mock).mockResolvedValue([expenseTransaction, incomeTransaction]);

    const result = await createTransferTransaction(expenseProps, incomeProps);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(expenseTransaction);
    expect(result[1]).toEqual(incomeTransaction);
  })
})
