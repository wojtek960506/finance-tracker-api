import { TransactionExchangeDTO } from "@schemas/transaction";
import { TransactionExchangeUpdateProps } from "@db/transactions";
import { prepareExchangeSpecificProps } from "./prepare-exchange-specific-props";
import { TransactionExchangeCreateProps } from "@db/transactions/persist-transaction";


export function prepareExchangeProps(
  dto: TransactionExchangeDTO,
  additionalProps: {
    ownerId: string,
    sourceIndexExpense: number,
    sourceIndexIncome: number,
  }
): {
  expenseTransactionProps: TransactionExchangeCreateProps,
  incomeTransactionProps: TransactionExchangeCreateProps,
}
export function prepareExchangeProps(
  dto: TransactionExchangeDTO,
): {
  expenseTransactionProps: TransactionExchangeUpdateProps,
  incomeTransactionProps: TransactionExchangeUpdateProps,
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
      } as TransactionExchangeCreateProps,
      incomeTransactionProps: {
        ...commonIncomeTransactionProps,
        ownerId,
        sourceIndex: sourceIndexIncome,
        sourceRefIndex: sourceIndexExpense,
      }
    }
  } else {
    return {
      expenseTransactionProps: commonExpenseTransactionProps as TransactionExchangeUpdateProps,
      incomeTransactionProps: commonIncomeTransactionProps as TransactionExchangeUpdateProps,
    }
  }
}