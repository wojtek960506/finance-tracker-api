import { describe, expect, it } from "vitest";
import { randomObjectIdString } from "@utils/random";
import { prepareTransferProps } from "./prepare-transfer-props";
import {
  OLD_getTransactionTransferDTO,
  OLD_getTransferTransactionProps,
} from "@/test-utils/mocks/transactions";


describe("prepareTransferProps", () => {
  it("prepare props for create", () => {
    const dto = OLD_getTransactionTransferDTO();
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

    const mockProps = OLD_getTransferTransactionProps(
      { ownerId: OWNER_ID, sourceIndexExpense: EXPENSE_IDX, sourceIndexIncome: INCOME_IDX }
    );

    expect(expenseTransactionProps).toEqual(mockProps.expenseProps);
    expect(incomeTransactionProps).toEqual(mockProps.incomeProps);
  })

  it("prepare props for update", () => {
    const { additionalDescription, ...dto } = OLD_getTransactionTransferDTO();

    const {
      expenseTransactionProps,
      incomeTransactionProps,
    } = prepareTransferProps(dto);

    const mockProps = OLD_getTransferTransactionProps();
    
    const shortenDescription = (description: string, endingToErase: string) => (
      description.slice(0, description.indexOf(endingToErase)).trim()
    )

    mockProps.expenseProps.description = shortenDescription(
      mockProps.expenseProps.description,
      additionalDescription ? `(${additionalDescription})` : "",
    )
    mockProps.incomeProps.description = shortenDescription(
      mockProps.incomeProps.description,
      additionalDescription ? `(${additionalDescription})` : "",
    )

    expect(expenseTransactionProps).toEqual(mockProps.expenseProps);
    expect(incomeTransactionProps).toEqual(mockProps.incomeProps);
  })
})