import { TransferTransactionProps } from "@db/transactions/persist-transaction";
import { TransferTransactionUpdateProps } from "@db/transactions/save-transaction-changes";
import {
  TransactionCreateTransferDTO,
  TransactionUpdateTransferDTO
} from "@schemas/transaction";


export function prepareTransferProps(
  body: TransactionCreateTransferDTO,
  additionalProps: {
    ownerId: string,
    sourceIndexExpense: number,
    sourceIndexIncome: number,
  }
): {
  expenseTransactionProps: TransferTransactionProps,
  incomeTransactionProps: TransferTransactionProps,
}
export function prepareTransferProps(
  body: TransactionUpdateTransferDTO,
): {
  expenseTransactionProps: TransferTransactionUpdateProps,
  incomeTransactionProps: TransferTransactionUpdateProps,
}
export function prepareTransferProps (
  body: TransactionCreateTransferDTO | TransactionUpdateTransferDTO,
  additionalProps?: {
    ownerId: string,
    sourceIndexExpense: number,
    sourceIndexIncome: number,
  }
) {

  // TODO for now `accountExpense` and `accountIncome` are not translated in the body,
  // so decide how to handle it
  let description = `${body.accountExpense} --> ${body.accountIncome}`;
  if (body.additionalDescription) description += ` (${body.additionalDescription})`;

  const commonTransactionProps = {
      category: "myAccount",
      date: body.date,
      amount: body.amount,
      currency: body.currency,
      paymentMethod: body.paymentMethod,
      description,
    }
  
  const commonExpenseTransactionProps = {
    ...commonTransactionProps,
    transactionType: "expense",
    account: body.accountExpense,
  };

  const commonIncomeTransactionProps = {
    ...commonTransactionProps,
    transactionType: "income",
    account: body.accountIncome,
  };

  if (additionalProps) {
    const { ownerId, sourceIndexExpense, sourceIndexIncome } = additionalProps;
    return {
      expenseTransactionProps: {
        ...commonExpenseTransactionProps,
        ownerId,
        sourceIndex: sourceIndexExpense,
        sourceRefIndex: sourceIndexIncome,
      } as TransferTransactionProps,
      incomeTransactionProps: {
        ...commonIncomeTransactionProps,
        ownerId,
        sourceIndex: sourceIndexIncome,
        sourceRefIndex: sourceIndexExpense,
      }
    }
  } else {
    return {
      expenseTransactionProps: commonExpenseTransactionProps as TransferTransactionUpdateProps,
      incomeTransactionProps: commonIncomeTransactionProps as TransferTransactionUpdateProps,
    }
  }
}