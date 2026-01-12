import { randomObjectIdString } from "@utils/random";
import { describe, expect, it } from "vitest";
import { prepareTransferProps } from "./prepare-transfer-props";
import {
  getTransferTransactionProps,
  getTransactionCreateTransactionDTO,
} from "@utils/__mocks__/transactions/create-transfer";


describe("prepareTransferProps", () => {
  it("prepareProps", () => {
    const dto = getTransactionCreateTransactionDTO();
    const OWNER_ID = randomObjectIdString();
    const EXPENSE_IDX = 1;
    const INCOME_IDX = 2;

    const {
      expenseTransactionProps: expenseProps,
      incomeTransactionProps: incomeProps,
    } = prepareTransferProps(dto, OWNER_ID, EXPENSE_IDX, INCOME_IDX);

    const mockProps = getTransferTransactionProps(OWNER_ID, EXPENSE_IDX, INCOME_IDX);

    expect(expenseProps).toEqual(mockProps.expenseProps);
    expect(incomeProps).toEqual(mockProps.incomeProps);
  })
})