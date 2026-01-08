import { describe, expect, it } from "vitest";
import { randomObjectIdString } from "@utils/random";
import { prepareExchangeProps } from "./prepare-exchange-props";
import { TransactionCreateExchangeDTO } from "@schemas/transaction";


describe("prepareExchangeProps", () => {
  it("prepare props", () => {
    const dto: TransactionCreateExchangeDTO = {
      date: new Date("2026-01-08"),
      amountExpense: 25,
      amountIncome: 90.26,
      currencyExpense: "USD",
      currencyIncome: "PLN",
      account: "revolut",
      paymentMethod: "bankTransfer",
      additionalDescription: "for travel",
    }
    const OWNER_ID = randomObjectIdString();
    const EXPENSE_IDX = 1;
    const INCOME_IDX = 2;

    const {
      expenseTransactionProps: expenseProps,
      incomeTransactionProps: incomeProps,
    } = prepareExchangeProps(dto, OWNER_ID, EXPENSE_IDX, INCOME_IDX);

    const commonProps = {
      category: "exchange",
      ownerId: OWNER_ID,
      date: dto.date,
      account: dto.account,
      paymentMethod: dto.paymentMethod,
      description: "USD -> PLN (for travel)",
      currencies: "USD/PLN",
      exchangeRate: dto.amountIncome / dto.amountExpense,
    }

    expect(expenseProps).toEqual({
      ...commonProps,
      transactionType: "expense",
      amount: dto.amountExpense,
      currency: dto.currencyExpense,
      sourceIndex: EXPENSE_IDX,
      sourceRefIndex: INCOME_IDX,
    });
    expect(incomeProps).toEqual({
      ...commonProps,
      transactionType: "income",
      amount: dto.amountIncome,
      currency: dto.currencyIncome,
      sourceIndex: INCOME_IDX,
      sourceRefIndex: EXPENSE_IDX,
    });
  })
})