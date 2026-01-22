import { TransactionCreateTransferDTO } from "@schemas/transaction";
import { TransferTransactionProps } from "@db/transactions/persist-transaction";
import { TransferTransactionUpdateProps } from "@db/transactions";


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
  additionalProps?: {
    ownerId: string,
    sourceIndexExpense: number,
    sourceIndexIncome: number,
  }
) => {
  const commonProps = {
    category: "myAccount",
    // ownerId,
    date,
    amount,
    currency,
    paymentMethod,
    description: `${accountExpense} --> ${accountIncome} (${additionalDescription})`,
  }

  const commonExpenseProps = {
    ...commonProps,
    transactionType: "expense",
    account: accountExpense,
  }

  const commonIncomeProps = {
    ...commonProps,
    transactionType: "income",
    account: accountIncome,
  }

  if (additionalProps) {
    const { ownerId, sourceIndexExpense, sourceIndexIncome } = additionalProps;
    return {
      expenseProps: {
        ...commonExpenseProps,
        sourceIndex: sourceIndexExpense,
        sourceRefIndex: sourceIndexIncome,
        ownerId,
      } as TransferTransactionProps,
      incomeProps: {
        ...commonIncomeProps,
        sourceIndex: sourceIndexIncome,
        sourceRefIndex: sourceIndexExpense,
        ownerId,
      } as TransferTransactionProps
    }
  } else {
    return {
      expenseProps: commonExpenseProps as TransferTransactionUpdateProps,
      incomeProps: commonIncomeProps as TransferTransactionUpdateProps,
    }
  }
}

export const getTransferTransactionResultJSON = (
  ownerId: string,
  expenseSourceIndex: number,
  incomeSourceIndex: number,
  expenseId: string,
  incomeId: string,
) => {
  const { expenseProps, incomeProps } = getTransferTransactionProps({
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