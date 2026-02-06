import { describe, expect, it } from "vitest";
import { randomObjectIdString } from "@utils/random";
import { prepareExchangeProps } from "./prepare-exchange-props";
import {
  OLD_getTransactionExchangeDTO,
  OLD_getExchangeTransactionProps,
} from "@/test-utils/mocks/transactions";


describe("prepareExchangeProps", () => {
  it("prepare props for create", () => {
    const dto = OLD_getTransactionExchangeDTO();
    const OWNER_ID = randomObjectIdString();
    const EXPENSE_IDX = 1;
    const INCOME_IDX = 2;

    const {
      expenseTransactionProps,
      incomeTransactionProps,
    } = prepareExchangeProps(
      dto,
      {
        ownerId: OWNER_ID,
        sourceIndexExpense: EXPENSE_IDX,
        sourceIndexIncome: INCOME_IDX
      }
    );

    const mockProps = OLD_getExchangeTransactionProps({
      ownerId: OWNER_ID,
      sourceIndexExpense: EXPENSE_IDX,
      sourceIndexIncome: INCOME_IDX,
    });

    expect(expenseTransactionProps).toEqual(mockProps.expenseProps);
    expect(incomeTransactionProps).toEqual(mockProps.incomeProps);
  })

  it("prepare props for update", () => {
    const dto = OLD_getTransactionExchangeDTO();

    const {
      expenseTransactionProps,
      incomeTransactionProps,
    } = prepareExchangeProps(dto);

    const mockProps = OLD_getExchangeTransactionProps();

    expect(expenseTransactionProps).toEqual(mockProps.expenseProps);
    expect(incomeTransactionProps).toEqual(mockProps.incomeProps);
  })
})