import { TransactionTransferDTO } from "@schemas/transaction";
import { TransactionTransferCreateProps } from "@db/transactions/persist-transaction";
import { TransactionTransferUpdateProps } from "@db/transactions/save-transaction-changes";


export function prepareTransferProps(
  body: TransactionTransferDTO,
  additionalProps: {
    ownerId: string,
    sourceIndexExpense: number,
    sourceIndexIncome: number,
  }
): {
  expenseTransactionProps: TransactionTransferCreateProps,
  incomeTransactionProps: TransactionTransferCreateProps,
}
export function prepareTransferProps(
  body: TransactionTransferDTO,
): {
  expenseTransactionProps: TransactionTransferUpdateProps,
  incomeTransactionProps: TransactionTransferUpdateProps,
}
export function prepareTransferProps (
  body: TransactionTransferDTO,
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
      } as TransactionTransferCreateProps,
      incomeTransactionProps: {
        ...commonIncomeTransactionProps,
        ownerId,
        sourceIndex: sourceIndexIncome,
        sourceRefIndex: sourceIndexExpense,
      }
    }
  } else {
    return {
      expenseTransactionProps: commonExpenseTransactionProps as TransactionTransferUpdateProps,
      incomeTransactionProps: commonIncomeTransactionProps as TransactionTransferUpdateProps,
    }
  }
}