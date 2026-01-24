import { ExchangeTransactionUpdateProps } from "@db/transactions";
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
  amountExpense,
  amountIncome,
  currencyExpense,
  currencyIncome,
  account,
  paymentMethod,
  additionalDescription,
} as TransactionCreateExchangeDTO);

type AdditionalProps = {
  ownerId: string,
  sourceIndexExpense: number,
  sourceIndexIncome: number,
}

export function getExchangeTransactionProps (): {
  expenseProps: ExchangeTransactionUpdateProps,
  incomeProps: ExchangeTransactionUpdateProps,
}
export function getExchangeTransactionProps (additionalProps: AdditionalProps): {
  expenseProps: ExchangeTransactionProps,
  incomeProps: ExchangeTransactionProps,
}
export function getExchangeTransactionProps (additionalProps?: AdditionalProps) {
  const commonProps = {
    category: "exchange",
    date,
    account,
    paymentMethod,
    description: `${currencyExpense} -> ${currencyIncome} (${additionalDescription})`,
    currencies: `${currencyExpense}/${currencyIncome}`,
    exchangeRate: amountIncome / amountExpense,
  }

  const commonExpenseProps = {
    ...commonProps,
    transactionType: "expense",
    amount: amountExpense,
    currency: currencyExpense,
  }

  const commonIncomeProps = {
    ...commonProps,
    transactionType: "income",
    amount: amountIncome,
    currency: currencyIncome,
  }

  if (additionalProps) {
    const { ownerId, sourceIndexExpense, sourceIndexIncome } = additionalProps;
    return {
      expenseProps: {
        ...commonExpenseProps,
        sourceIndex: sourceIndexExpense,
        sourceRefIndex: sourceIndexIncome,
        ownerId,
      } as ExchangeTransactionProps,
      incomeProps: {
        ...commonIncomeProps,
        sourceIndex: sourceIndexIncome,
        sourceRefIndex: sourceIndexExpense,
        ownerId,
      } as ExchangeTransactionProps,
    }
  } else {
    return {
      expenseProps: commonExpenseProps as ExchangeTransactionUpdateProps,
      incomeProps: commonIncomeProps as ExchangeTransactionUpdateProps,
    }
  }
}

export const getExchangeTransactionResultJSON = (
  ownerId: string,
  expenseSourceIndex: number,
  incomeSourceIndex: number,
  expenseId: string,
  incomeId: string,
) => {
  const { expenseProps, incomeProps } = getExchangeTransactionProps({
    ownerId, sourceIndexExpense: expenseSourceIndex, sourceIndexIncome: incomeSourceIndex
  });
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
