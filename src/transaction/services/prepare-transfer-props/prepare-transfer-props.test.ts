import { describe, expect, it } from "vitest";
import { USER_ID_STR } from "@/test-utils/factories/general";
import { prepareTransferProps } from "./prepare-transfer-props";
import { TRANSFER_CATEGORY_ID_STR } from "@/test-utils/factories/category";
import {
  getTransferTransactionDTO,
  getTransferTransactionProps,
  TRANSFER_TXN_INCOME_SRC_IDX,
  TRANSFER_TXN_EXPENSE_SRC_IDX,
} from "@/test-utils/factories/transaction";


describe("prepareTransferProps", () => {
  it("prepare props for create", () => {
    const dto = getTransferTransactionDTO();
    const mockProps = getTransferTransactionProps(true)

    const {
      expenseTransactionProps,
      incomeTransactionProps,
    } = prepareTransferProps(
      dto,
      { categoryId: TRANSFER_CATEGORY_ID_STR },
      {
        ownerId: USER_ID_STR,
        sourceIndexExpense: TRANSFER_TXN_EXPENSE_SRC_IDX,
        sourceIndexIncome: TRANSFER_TXN_INCOME_SRC_IDX,
      }
    );

    expect(expenseTransactionProps).toEqual(mockProps.expenseProps);
    expect(incomeTransactionProps).toEqual(mockProps.incomeProps);
  })

  it("prepare props for update", () => {
    const { additionalDescription, ...dto } = getTransferTransactionDTO();
    const mockProps = getTransferTransactionProps();

    const {
      expenseTransactionProps,
      incomeTransactionProps,
    } = prepareTransferProps(dto, { categoryId: TRANSFER_CATEGORY_ID_STR });

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