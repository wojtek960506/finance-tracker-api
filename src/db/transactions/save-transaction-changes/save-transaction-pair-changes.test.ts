import { startSession } from "mongoose";
import { randomObjectIdString } from "@utils/random";
import { saveTransactionPairChanges } from "@db/transactions";
import { afterEach, describe, expect, it, Mock, vi } from "vitest";
import { serializeTransaction } from "@schemas/serialize-transaction";
import {
  getTransferTransactionProps,
  getTransferTransactionResultJSON,
} from "@/test-utils/mocks/transactions";


const withTransactionMock = vi.fn();
const endSessionMock = vi.fn();

vi.mock("mongoose", async () => {
  const actual = await vi.importActual("mongoose");

  return {
    ...actual,
    startSession: vi.fn(async () => ({
      withTransaction: withTransactionMock,
      endSession: endSessionMock,
    }))
  }
});

vi.mock("@schemas/serialize-transaction", () => ({ serializeTransaction: vi.fn() }));

describe("saveTransactionPairChanges", () => {
  const [saveMock1, saveMock2] = [vi.fn(), vi.fn()];

  const [EXPENSE_ID, INCOME_ID] = [randomObjectIdString(), randomObjectIdString()];
  const [EXPENSE_SOURCE_INDEX, INCOME_SOURCE_INDEX] = [1, 2];
  const OWNER_ID = randomObjectIdString();
  const { expenseProps, incomeProps } = getTransferTransactionProps();

  const transactionExpense = {
    ...expenseProps,
    _id: EXPENSE_ID,
    ownerId: OWNER_ID,
    refId: INCOME_ID,
    sourceIndex: EXPENSE_SOURCE_INDEX,
    sourceRefIndex: INCOME_SOURCE_INDEX,
    save: saveMock1,
  } as any;
  const transactionIncome = {
    ...incomeProps,
    _id: INCOME_ID,
    ownerId: OWNER_ID,
    refId: EXPENSE_ID,
    sourceIndex: INCOME_SOURCE_INDEX,
    sourceRefIndex: EXPENSE_SOURCE_INDEX,
    save: saveMock2,
  } as any;

  const newPropsExpense = {
    ...expenseProps,
    description: "new desc",
    amount: 100
  }
  const newPropsIncome = {
    ...incomeProps,
    description: "another desc",
    amount: 256
  }

  afterEach( () => { vi.clearAllMocks(); } );

  it("reference transaction is an income", async () => {
    const [expenseJSON, incomeJSON] = getTransferTransactionResultJSON(
      OWNER_ID, EXPENSE_SOURCE_INDEX, INCOME_SOURCE_INDEX, EXPENSE_ID, INCOME_ID
    )

    const expenseAfterUpdate = { ...transactionExpense, ...newPropsExpense };
    const incomeAfterUpdate = { ...transactionIncome, ...newPropsIncome };

    const expenseAfterSerialization = { ...expenseJSON, ...newPropsExpense };
    const incomeAfterSerialization = { ...incomeJSON, ...newPropsIncome };

    withTransactionMock.mockImplementation(async (fn) => {
      await fn();
    });
    (serializeTransaction as Mock)
      .mockReturnValueOnce(expenseAfterSerialization)
      .mockReturnValueOnce(incomeAfterSerialization);

    const result = await saveTransactionPairChanges(
      transactionExpense, transactionIncome, newPropsExpense, newPropsIncome
    );

    expect(startSession).toHaveBeenCalled();
    expect(withTransactionMock).toHaveBeenCalledOnce();
    expect(endSessionMock).toHaveBeenCalledOnce();
    expect(serializeTransaction).toHaveBeenCalledTimes(2);
    expect(serializeTransaction).toHaveBeenNthCalledWith(1, expenseAfterUpdate);
    expect(serializeTransaction).toHaveBeenNthCalledWith(2, incomeAfterUpdate);
    expect(saveMock1).toHaveBeenCalledOnce();
    expect(saveMock2).toHaveBeenCalledOnce();
    expect(result).toEqual([expenseAfterSerialization, incomeAfterSerialization]);
  })

  it("reference transaction is an expense", async () => {
    const [expenseJSON, incomeJSON] = getTransferTransactionResultJSON(
      OWNER_ID, INCOME_SOURCE_INDEX, EXPENSE_SOURCE_INDEX, INCOME_ID, EXPENSE_ID
    )

    const expenseAfterUpdate = { ...transactionExpense, ...newPropsExpense };
    const incomeAfterUpdate = { ...transactionIncome, ...newPropsIncome };

    const expenseAfterSerialization = { ...expenseJSON, ...newPropsExpense };
    const incomeAfterSerialization = { ...incomeJSON, ...newPropsIncome };

    withTransactionMock.mockImplementation(async (fn) => {
      await fn();
    });
    (serializeTransaction as Mock)
      .mockReturnValueOnce(incomeAfterSerialization)
      .mockReturnValueOnce(expenseAfterSerialization);

    const result = await saveTransactionPairChanges(
      transactionIncome, transactionExpense, newPropsExpense, newPropsIncome
    );

    expect(startSession).toHaveBeenCalled();
    expect(withTransactionMock).toHaveBeenCalledOnce();
    expect(endSessionMock).toHaveBeenCalledOnce();
    expect(serializeTransaction).toHaveBeenCalledTimes(2);
    expect(serializeTransaction).toHaveBeenNthCalledWith(1, incomeAfterUpdate);
    expect(serializeTransaction).toHaveBeenNthCalledWith(2, expenseAfterUpdate);
    expect(saveMock1).toHaveBeenCalledOnce();
    expect(saveMock2).toHaveBeenCalledOnce();
    expect(result).toEqual([incomeAfterSerialization, expenseAfterSerialization]);
  })

  it("end session even when the error is thrown within `withTransaction`", async () => {
    withTransactionMock.mockImplementationOnce(async () => {
      throw new Error("fails");
    });

    await expect(saveTransactionPairChanges(
      transactionIncome, transactionExpense, newPropsExpense, newPropsIncome)
    ).rejects.toThrow();

    expect(endSessionMock).toHaveBeenCalledOnce();
    expect(withTransactionMock).toHaveBeenCalledOnce();
    expect(serializeTransaction).not.toHaveBeenCalled();
  })
})
