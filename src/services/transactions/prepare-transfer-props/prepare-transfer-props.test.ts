import { describe, expect, it } from "vitest";
import { randomObjectIdString } from "@utils/random";
import { prepareTransferProps } from "./prepare-transfer-props";
import {
  getTransferTransactionProps,
  getTransactionCreateTransferDTO,
} from "@/test-utils/mocks/transactions";


describe("prepareTransferProps", () => {
  it("prepare props for create", () => {
    const dto = getTransactionCreateTransferDTO();
    const OWNER_ID = randomObjectIdString();
    const EXPENSE_IDX = 1;
    const INCOME_IDX = 2;

    const {
      expenseTransactionProps,
      incomeTransactionProps,
    } = prepareTransferProps(
      dto,
      {
        ownerId: OWNER_ID,
        sourceIndexExpense: EXPENSE_IDX,
        sourceIndexIncome: INCOME_IDX,
      }
    );

    const mockProps = getTransferTransactionProps(
      { ownerId: OWNER_ID, sourceIndexExpense: EXPENSE_IDX, sourceIndexIncome: INCOME_IDX }
    );

    expect(expenseTransactionProps).toEqual(mockProps.expenseProps);
    expect(incomeTransactionProps).toEqual(mockProps.incomeProps);
  })

  it("prepare props for update", () => {
    const dto = getTransactionCreateTransferDTO();

    const {
      expenseTransactionProps,
      incomeTransactionProps,
    } = prepareTransferProps(dto);

    const mockProps = getTransferTransactionProps();

    expect(expenseTransactionProps).toEqual(mockProps.expenseProps);
    expect(incomeTransactionProps).toEqual(mockProps.incomeProps);
  })
})