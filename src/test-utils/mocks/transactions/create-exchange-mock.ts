import { TransactionCreateExchangeDTO } from "@schemas/transaction";
import { ExchangeTransactionProps } from "@db/transactions/persist-transaction";


const date = new Date("2026-01-08");
const amountExpense = 25;
const amountIncome = 90.26;
const currencyExpense = "USD";
const currencyIncome = "PLN";
const account = "revolut";
const paymentMethod = "bankTransfer";
const additionalDescription = "for travel";

export const getTransactionCreateExchangeDTO = () => ({
  date,
  amountExpense: 25,
  amountIncome: 90.26,
  currencyExpense: "USD",
  currencyIncome: "PLN",
  account: "revolut",
  paymentMethod: "bankTransfer",
  additionalDescription: "for travel",
} as TransactionCreateExchangeDTO);

export const getExchangeTransactionProps = (
  ownerId: string,
  expenseIdx: number,
  incomeIdx: number
) => {
  const commonProps = {
    category: "exchange",
    ownerId,
    date,
    account,
    paymentMethod,
    description: `${currencyExpense} -> ${currencyIncome} (${additionalDescription})`,
    currencies: `${currencyExpense}/${currencyIncome}`,
    exchangeRate: amountIncome / amountExpense,
  }

  const expenseProps: ExchangeTransactionProps = {
    ...commonProps,
    transactionType: "expense",
    amount: amountExpense,
    currency: currencyExpense,
    sourceIndex: expenseIdx,
    sourceRefIndex: incomeIdx,
  }

  const incomeProps: ExchangeTransactionProps = {
    ...commonProps,
    transactionType: "income",
    amount: amountIncome,
    currency: currencyIncome,
    sourceIndex: incomeIdx,
    sourceRefIndex: expenseIdx,
  }

  return { expenseProps, incomeProps };
}

export const getExchangeTransactionResultJSON = (
  ownerId: string,
  expenseSourceIndex: number,
  incomeSourceIndex: number,
  expenseId: string,
  incomeId: string,
) => {
  const { expenseProps, incomeProps } = getExchangeTransactionProps(
    ownerId, expenseSourceIndex, incomeSourceIndex
  );
  const expenseTransaction = { 
    ...expenseProps,
    id: expenseId,
    refId: incomeId,
    date: expenseProps.date.toISOString(),
  };
  const incomeTransaction = {
    ...incomeProps,
    id: incomeId,
    refId: expenseId,
    date: expenseProps.date.toISOString(),
  };
  return [expenseTransaction, incomeTransaction];
}
