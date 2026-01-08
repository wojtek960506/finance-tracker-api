import { ExchangeTransactionProps } from "@services/transactions";
import { TransactionCreateExchangeDTO } from "@schemas/transaction";
import { prepareExchangeSpecificProps } from "./prepare-exchange-specific-props";


export const prepareExchangeProps = (
  body: TransactionCreateExchangeDTO,
  ownerId: string,
  sourceIndexExpense: number,
  sourceIndexIncome: number,
) => {
  const { description, currencies, exchangeRate } = prepareExchangeSpecificProps(body);

  const commonTransactionProps = {
    category: "exchange",
    ownerId,
    date: body.date,
    account: body.account,
    paymentMethod: body.paymentMethod,
    description,
    currencies,
    exchangeRate,
  }

  const expenseTransactionProps: ExchangeTransactionProps = {
    ...commonTransactionProps,
    transactionType: "expense",
    amount: body.amountExpense,
    currency: body.currencyExpense,
    sourceIndex: sourceIndexExpense,
    sourceRefIndex: sourceIndexIncome,
  }

  const incomeTransactionProps: ExchangeTransactionProps = {
    ...commonTransactionProps,
    transactionType: "income",
    amount: body.amountIncome,
    currency: body.currencyIncome,
    sourceIndex: sourceIndexIncome,
    sourceRefIndex: sourceIndexExpense,
  }

  return { expenseTransactionProps, incomeTransactionProps };
}