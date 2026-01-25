import { ExchangeTransactionUpdateProps } from "@db/transactions";
import { TransactionExchangeDTO } from "@schemas/transaction";
import { ExchangeTransactionProps } from "@db/transactions/persist-transaction";
import { prepareExchangeSpecificProps } from "./prepare-exchange-specific-props";


export function prepareExchangeProps(
  dto: TransactionExchangeDTO,
  additionalProps: {
    ownerId: string,
    sourceIndexExpense: number,
    sourceIndexIncome: number,
  }
): {
  expenseTransactionProps: ExchangeTransactionProps,
  incomeTransactionProps: ExchangeTransactionProps,
}
export function prepareExchangeProps(
  dto: TransactionExchangeDTO,
): {
  expenseTransactionProps: ExchangeTransactionUpdateProps,
  incomeTransactionProps: ExchangeTransactionUpdateProps,
}
export function prepareExchangeProps(
  dto: TransactionExchangeDTO,
  additionalProps?: {
    ownerId: string,
    sourceIndexExpense: number,
    sourceIndexIncome: number,
  }
) {
  const { description, currencies, exchangeRate } = prepareExchangeSpecificProps(dto);

  const commonTransactionProps = {
    category: "exchange",
    date: dto.date,
    account: dto.account,
    paymentMethod: dto.paymentMethod,
    description,
    currencies,
    exchangeRate,
  }

  const commonExpenseTransactionProps = {
    ...commonTransactionProps,
    transactionType: "expense",
    amount: dto.amountExpense,
    currency: dto.currencyExpense,
  }

  const commonIncomeTransactionProps = {
    ...commonTransactionProps,
    transactionType: "income",
    amount: dto.amountIncome,
    currency: dto.currencyIncome,
  }

  if (additionalProps) {
    const { ownerId, sourceIndexExpense, sourceIndexIncome } = additionalProps;
    return {
      expenseTransactionProps: {
        ...commonExpenseTransactionProps,
        ownerId,
        sourceIndex: sourceIndexExpense,
        sourceRefIndex: sourceIndexIncome,
      } as ExchangeTransactionProps,
      incomeTransactionProps: {
        ...commonIncomeTransactionProps,
        ownerId,
        sourceIndex: sourceIndexIncome,
        sourceRefIndex: sourceIndexExpense,
      }
    }
  } else {
    return {
      expenseTransactionProps: commonExpenseTransactionProps as ExchangeTransactionUpdateProps,
      incomeTransactionProps: commonIncomeTransactionProps as ExchangeTransactionUpdateProps,
    }
  }
}