import { TransactionCreateExchangeDTO } from "@schemas/transaction";
import { ExchangeTransactionProps } from "@db/transactions/persist-transaction";
import { prepareExchangeSpecificProps } from "./prepare-exchange-specific-props";


export const prepareExchangeProps = (
  dto: TransactionCreateExchangeDTO,
  ownerId: string,
  sourceIndexExpense: number,
  sourceIndexIncome: number,
) => {
  const { description, currencies, exchangeRate } = prepareExchangeSpecificProps(dto);

  const commonTransactionProps = {
    category: "exchange",
    ownerId,
    date: dto.date,
    account: dto.account,
    paymentMethod: dto.paymentMethod,
    description,
    currencies,
    exchangeRate,
  }

  const expenseTransactionProps: ExchangeTransactionProps = {
    ...commonTransactionProps,
    transactionType: "expense",
    amount: dto.amountExpense,
    currency: dto.currencyExpense,
    sourceIndex: sourceIndexExpense,
    sourceRefIndex: sourceIndexIncome,
  }

  const incomeTransactionProps: ExchangeTransactionProps = {
    ...commonTransactionProps,
    transactionType: "income",
    amount: dto.amountIncome,
    currency: dto.currencyIncome,
    sourceIndex: sourceIndexIncome,
    sourceRefIndex: sourceIndexExpense,
  }

  return { expenseTransactionProps, incomeTransactionProps };
}