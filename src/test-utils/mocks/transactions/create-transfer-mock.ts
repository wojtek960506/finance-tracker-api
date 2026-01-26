import { TransactionCreateTransferDTO } from "@schemas/transaction";
import { TransferTransactionProps } from "@db/transactions/persist-transaction";


const date = new Date("2026-01-09");
const amount = 77;
const currency = "PLN";
const accountExpense = "mBank";
const accountIncome = "veloBank";
const paymentMethod = "bankTransfer";
const additionalDescription = "savings";

export const getTransactionCreateTransferDTO = () => ({
  date,
  amount,
  currency,
  accountExpense,
  accountIncome,
  paymentMethod,
  additionalDescription,
} as TransactionCreateTransferDTO);

export const getTransferTransactionProps = (
  ownerId: string,
  expenseIdx: number,
  incomeIdx: number,
) => {
  const commonProps = {
    category: "myAccount",
    ownerId,
    date,
    amount,
    currency,
    paymentMethod,
    description: `${accountExpense} --> ${accountIncome} (${additionalDescription})`,
  }

  const expenseProps: TransferTransactionProps = {
    ...commonProps,
    transactionType: "expense",
    account: accountExpense,
    sourceIndex: expenseIdx,
    sourceRefIndex: incomeIdx
  }

  const incomeProps: TransferTransactionProps = {
    ...commonProps,
    transactionType: "income",
    account: accountIncome,
    sourceIndex: incomeIdx,
    sourceRefIndex: expenseIdx,
  }

  return { expenseProps, incomeProps };
}

export const getTransferTransactionResultJSON = (
  ownerId: string,
  expenseSourceIndex: number,
  incomeSourceIndex: number,
  expenseId: string,
  incomeId: string,
) => {
  const { expenseProps, incomeProps } = getTransferTransactionProps(
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