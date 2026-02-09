import { TransactionTransferDTO } from "@schemas/transaction";
import {
  TransactionTransferCreateProps,
  TransactionTransferUpdateProps,
} from "@db/transactions";
import {
  PrepareTransactionPropsContext,
  PrepareTransactionPropsObjectIds,
} from "@services/transactions/types";


export function prepareTransferProps(
  body: TransactionTransferDTO,
  objectIds: PrepareTransactionPropsObjectIds,
  additionalProps: PrepareTransactionPropsContext,
): {
  expenseTransactionProps: TransactionTransferCreateProps,
  incomeTransactionProps: TransactionTransferCreateProps,
}
export function prepareTransferProps(
  body: TransactionTransferDTO,
  objectIds: PrepareTransactionPropsObjectIds,
): {
  expenseTransactionProps: TransactionTransferUpdateProps,
  incomeTransactionProps: TransactionTransferUpdateProps,
}
export function prepareTransferProps (
  body: TransactionTransferDTO,
  objectIds: PrepareTransactionPropsObjectIds,
  additionalProps?: PrepareTransactionPropsContext,
) {
  const { categoryId } = objectIds;

  // TODO for now `accountExpense` and `accountIncome` are not translated in the body,
  // so decide how to handle it
  let description = `${body.accountExpense} --> ${body.accountIncome}`;
  if (body.additionalDescription) description += ` (${body.additionalDescription})`;

  const commonTransactionProps = {
    categoryId,
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