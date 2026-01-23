import { describe, expect, it } from "vitest";
import { randomObjectIdString } from "@utils/random";
import { prepareExchangeProps } from "./prepare-exchange-props";
import {
  getExchangeTransactionProps,
  getTransactionCreateExchangeDTO
} from "@/test-utils/mocks/transactions";


describe("prepareExchangeProps", () => {
  it("prepare props", () => {
    const dto = getTransactionCreateExchangeDTO();
    const OWNER_ID = randomObjectIdString();
    const EXPENSE_IDX = 1;
    const INCOME_IDX = 2;

    const {
      expenseTransactionProps: expenseProps,
      incomeTransactionProps: incomeProps,
    } = prepareExchangeProps(
      dto,
      {
        ownerId: OWNER_ID,
        sourceIndexExpense: EXPENSE_IDX,
        sourceIndexIncome: INCOME_IDX
      }
    );

    const mockProps = getExchangeTransactionProps(OWNER_ID, EXPENSE_IDX, INCOME_IDX);

    expect(expenseProps).toEqual(mockProps.expenseProps);
    expect(incomeProps).toEqual(mockProps.incomeProps);
  })
})