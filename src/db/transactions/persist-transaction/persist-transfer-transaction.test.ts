import { randomObjectIdString } from "@utils/random";
import { describe, expect, it, Mock, vi } from "vitest";
import { persistTransactionPair } from "./persist-transaction-pair";
import { getTransferTransactionProps } from "@utils/__mocks__/transactions/create-transfer";


vi.mock("@db/transactions/persist-transaction/persist-transaction-pair", () => ({
  persistTransactionPair: vi.fn(),
}));

describe("persistTransferTransaction", async () => {
  const EXPENSE_ID = randomObjectIdString();
  const INCOME_ID = randomObjectIdString();
  const {
    expenseProps,
    incomeProps,
  } = getTransferTransactionProps(randomObjectIdString(), 1, 2);
  const expenseTransaction = { ...expenseProps, id: EXPENSE_ID, refId: INCOME_ID };
  const incomeTransaction = { ...incomeProps, id: INCOME_ID, refId: EXPENSE_ID };
  
  it("persist pair for transfer transaction", async () => {
    (persistTransactionPair as Mock).mockResolvedValue([expenseTransaction, incomeTransaction]);

    const result = await persistTransactionPair(expenseProps, incomeProps);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(expenseTransaction);
    expect(result[1]).toEqual(incomeTransaction);
  })
})
