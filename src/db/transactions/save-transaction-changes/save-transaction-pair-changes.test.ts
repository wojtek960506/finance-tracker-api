import { startSession } from "mongoose";
import { serializeTransaction } from "@schemas/serializers";
import { saveTransactionPairChanges } from "@db/transactions";
import { afterEach, describe, expect, it, Mock, vi } from "vitest";
import {
  getExchangeTransactionProps,
  getExchangeTransactionResultSerialized,
} from "@/test-utils/factories/transaction";


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

vi.mock("@schemas/serializers", () => ({ serializeTransaction: vi.fn() }));

describe("saveTransactionPairChanges", () => {
  const [saveMock1, saveMock2] = [vi.fn(), vi.fn()];
  const [populateMock1, populateMock2] = [vi.fn(), vi.fn()];

  const { expenseProps, incomeProps } = getExchangeTransactionProps();

  const {
    expenseTransactionSerialized,
    incomeTransactionSerialized,
  } = getExchangeTransactionResultSerialized();


  const transactionExpense = {
    ...expenseTransactionSerialized,
    ...expenseProps,
    save: saveMock1,
    populate: populateMock1,
  } as any;
  const transactionIncome = {
    ...incomeTransactionSerialized,
    ...incomeProps,
    save: saveMock2,
    populate: populateMock2,
  } as any;

  afterEach( () => { vi.clearAllMocks(); } );

  it("reference transaction is an income", async () => {
    

    withTransactionMock.mockImplementation(async (fn) => {
      await fn();
    });
    (serializeTransaction as Mock)
      .mockReturnValueOnce(transactionExpense)
      .mockReturnValueOnce(transactionIncome);

    const result = await saveTransactionPairChanges(
      transactionExpense, transactionIncome, expenseProps, incomeProps
    );

    expect(startSession).toHaveBeenCalled();
    expect(withTransactionMock).toHaveBeenCalledOnce();
    expect(endSessionMock).toHaveBeenCalledOnce();
    expect(serializeTransaction).toHaveBeenCalledTimes(2);
    expect(serializeTransaction).toHaveBeenNthCalledWith(1, transactionExpense);
    expect(serializeTransaction).toHaveBeenNthCalledWith(2, transactionIncome);
    expect(saveMock1).toHaveBeenCalledOnce();
    expect(populateMock1).toHaveBeenCalledOnce();
    expect(saveMock2).toHaveBeenCalledOnce();
    expect(populateMock2).toHaveBeenCalledOnce();
    expect(result).toEqual([transactionExpense, transactionIncome]);
  })

  it("reference transaction is an expense", async () => {

    withTransactionMock.mockImplementation(async (fn) => {
      await fn();
    });

    
    const mainTransactionIsIncome = {
      ...incomeTransactionSerialized,
      ...incomeProps,
      save: saveMock2,
      populate: populateMock2,
    } as any;

    const refTransactionIsExpense = {
      ...expenseTransactionSerialized,
      ...expenseProps,
      save: saveMock1,
      populate: populateMock1,
    } as any;

    (serializeTransaction as Mock)
      .mockReturnValueOnce(mainTransactionIsIncome)
      .mockReturnValueOnce(refTransactionIsExpense);

    const result = await saveTransactionPairChanges(
      mainTransactionIsIncome, refTransactionIsExpense, expenseProps, incomeProps
    );

    expect(startSession).toHaveBeenCalled();
    expect(withTransactionMock).toHaveBeenCalledOnce();
    expect(endSessionMock).toHaveBeenCalledOnce();
    expect(serializeTransaction).toHaveBeenCalledTimes(2);
    expect(serializeTransaction).toHaveBeenNthCalledWith(1, mainTransactionIsIncome);
    expect(serializeTransaction).toHaveBeenNthCalledWith(2, refTransactionIsExpense);
    expect(saveMock1).toHaveBeenCalledOnce();
    expect(populateMock1).toHaveBeenCalledOnce();
    expect(saveMock2).toHaveBeenCalledOnce();
    expect(populateMock2).toHaveBeenCalledOnce();
    expect(result).toEqual([mainTransactionIsIncome, refTransactionIsExpense]);
  })

  it("end session even when the error is thrown within `withTransaction`", async () => {
    withTransactionMock.mockImplementationOnce(async () => {
      throw new Error("fails");
    });

    await expect(saveTransactionPairChanges(
      transactionExpense, transactionIncome, expenseProps, incomeProps)
    ).rejects.toThrow();

    expect(endSessionMock).toHaveBeenCalledOnce();
    expect(withTransactionMock).toHaveBeenCalledOnce();
    expect(serializeTransaction).not.toHaveBeenCalled();
  })
});
