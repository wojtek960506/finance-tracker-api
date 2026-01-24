import { randomObjectIdString } from "@utils/random";
import { TransactionModel } from "@models/transaction-model";
import { afterEach, describe, expect, it, Mock, vi } from "vitest";
import { persistTransactionPair } from "./persist-transaction-pair";
import { serializeTransaction } from "@schemas/serialize-transaction";
import {
  persistTransferTransaction,
  persistExchangeTransaction,
  persistStandardTransaction,
} from "./persist-transaction";
import {
  getStandardTransactionProps,
  getTransferTransactionProps,
  getExchangeTransactionProps,
} from "@/test-utils/mocks/transactions";


vi.mock("@models/transaction-model", () => ({
  TransactionModel: { create: vi.fn() }
}));

vi.mock("@schemas/serialize-transaction", () => ({
  serializeTransaction: vi.fn(),
}))

vi.mock("@db/transactions/persist-transaction/persist-transaction-pair", () => ({
  persistTransactionPair: vi.fn(),
}));

describe("persistTransaction", async () => {
  const [EXPENSE_ID, INCOME_ID] = [randomObjectIdString(), randomObjectIdString()];
  const [EXPENSE_SOURCE_INDEX, INCOME_SOURCE_INDEX] = [1, 2];
  const OWNER_ID = randomObjectIdString();
  
  afterEach(() => { vi.clearAllMocks() });

  it("standard transaction is created", async () => {
    const props = getStandardTransactionProps(OWNER_ID, EXPENSE_SOURCE_INDEX);
    const transaction = { ...props, id: EXPENSE_ID };
    (TransactionModel.create as Mock).mockResolvedValue(transaction);
    (serializeTransaction as Mock)
      .mockReturnValueOnce(transaction)

    const result = await persistStandardTransaction(props);

    expect(TransactionModel.create).toHaveBeenCalledOnce();
    expect(TransactionModel.create).toHaveBeenCalledWith(props);
    expect(serializeTransaction).toHaveBeenCalledWith(transaction);
    expect(result).toEqual(transaction);
  })
  
  it("persist pair for exchange transaction", async () => {
    const { expenseProps, incomeProps } = getExchangeTransactionProps({
      ownerId: randomObjectIdString(),
      sourceIndexExpense: EXPENSE_SOURCE_INDEX,
      sourceIndexIncome: INCOME_SOURCE_INDEX,
    });
    const expenseTransaction = { ...expenseProps, id: EXPENSE_ID, refId: INCOME_ID };
    const incomeTransaction = { ...incomeProps, id: INCOME_ID, refId: EXPENSE_ID };
    (persistTransactionPair as Mock).mockResolvedValue([expenseTransaction, incomeTransaction]);

    const result = await persistExchangeTransaction(expenseProps, incomeProps);

    expect(persistTransactionPair).toHaveBeenCalledOnce();
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(expenseTransaction);
    expect(result[1]).toEqual(incomeTransaction);
  })

  it("persist pair for transfer transaction", async () => {
    const { expenseProps, incomeProps } = getTransferTransactionProps({
      ownerId: randomObjectIdString(),
      sourceIndexExpense: EXPENSE_SOURCE_INDEX,
      sourceIndexIncome: INCOME_SOURCE_INDEX,
    });
    const expenseTransaction = { ...expenseProps, id: EXPENSE_ID, refId: INCOME_ID };
    const incomeTransaction = { ...incomeProps, id: INCOME_ID, refId: EXPENSE_ID };
    (persistTransactionPair as Mock).mockResolvedValue([expenseTransaction, incomeTransaction]);

    const result = await persistTransferTransaction(expenseProps, incomeProps);

    expect(persistTransactionPair).toHaveBeenCalledOnce();
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(expenseTransaction);
    expect(result[1]).toEqual(incomeTransaction);
  })
})