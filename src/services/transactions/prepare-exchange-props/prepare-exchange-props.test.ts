import { describe, expect, it } from "vitest";
import { USER_ID_STR } from "@/test-utils/factories/general";
import { prepareExchangeProps } from "./prepare-exchange-props";
import { EXCHANGE_CATEGORY_ID_STR } from "@/test-utils/factories/category";
import {
  getExchangeTransactionDTO,
  getExchangeTransactionProps,
  EXCHANGE_TXN_INCOME_SRC_IDX,
  EXCHANGE_TXN_EXPENSE_SRC_IDX,
} from "@/test-utils/factories/transaction";


describe("prepareExchangeProps", () => {
  it("prepare props for create", () => {
    const dto = getExchangeTransactionDTO();
    const mockProps = getExchangeTransactionProps(true);

    const {
      expenseTransactionProps,
      incomeTransactionProps,
    } = prepareExchangeProps(
      dto,
      { categoryId: EXCHANGE_CATEGORY_ID_STR },
      {
        ownerId: USER_ID_STR,
        sourceIndexExpense: EXCHANGE_TXN_EXPENSE_SRC_IDX,
        sourceIndexIncome: EXCHANGE_TXN_INCOME_SRC_IDX,
      }
    );

    expect(expenseTransactionProps).toEqual(mockProps.expenseProps);
    expect(incomeTransactionProps).toEqual(mockProps.incomeProps);
  });

  it("prepare props for update", () => {
    const dto = getExchangeTransactionDTO();
    const mockProps = getExchangeTransactionProps();

    const {
      expenseTransactionProps,
      incomeTransactionProps,
    } = prepareExchangeProps(dto, { categoryId: EXCHANGE_CATEGORY_ID_STR });

    expect(expenseTransactionProps).toEqual(mockProps.expenseProps);
    expect(incomeTransactionProps).toEqual(mockProps.incomeProps);
  });
});
