import { TransferTransactionProps } from "@services/transactions";
import { TransactionCreateTransferDTO } from "@schemas/transaction";

const date = new Date("2026-01-09");
const amount = 77;
const currency = "PLN";
const accountExpense = "mBank";
const accountIncome = "veloBank";
const paymentMethod = "bankTransfer";
const additionalDescription = "savings";

export const getTransactionCreateTransactionDTO = () => ({
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