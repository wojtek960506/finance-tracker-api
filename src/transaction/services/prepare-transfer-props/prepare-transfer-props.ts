import {
  TransactionTransferCreateProps,
  TransactionTransferUpdateProps,
} from '@transaction/db';
import { TransactionTransferDTO } from '@transaction/schema';
import {
  PrepareTransactionPropsContext,
  PrepareTransactionPropsObjectIds,
} from '@transaction/services/types';

type PrepareTransferPropsContext = Partial<PrepareTransactionPropsContext> & {
  accountExpenseName?: string;
  accountIncomeName?: string;
};

export function prepareTransferProps(
  body: TransactionTransferDTO,
  objectIds: PrepareTransactionPropsObjectIds,
  additionalProps: PrepareTransferPropsContext,
): {
  expenseTransactionProps: TransactionTransferCreateProps;
  incomeTransactionProps: TransactionTransferCreateProps;
};
export function prepareTransferProps(
  body: TransactionTransferDTO,
  objectIds: PrepareTransactionPropsObjectIds,
): {
  expenseTransactionProps: TransactionTransferUpdateProps;
  incomeTransactionProps: TransactionTransferUpdateProps;
};
export function prepareTransferProps(
  body: TransactionTransferDTO,
  objectIds: PrepareTransactionPropsObjectIds,
  additionalProps?: PrepareTransferPropsContext,
) {
  const { categoryId } = objectIds;

  const accountExpenseLabel =
    additionalProps?.accountExpenseName ?? body.accountExpenseId;
  const accountIncomeLabel = additionalProps?.accountIncomeName ?? body.accountIncomeId;

  let description = `${accountExpenseLabel} --> ${accountIncomeLabel}`;
  if (body.additionalDescription) description += ` (${body.additionalDescription})`;

  // TODO - probably paymentMethodId has to be placed in 'objectIds`
  const commonTransactionProps = {
    categoryId,
    date: body.date,
    amount: body.amount,
    currency: body.currency,
    paymentMethodId: body.paymentMethodId,
    description,
  };

  const commonExpenseTransactionProps = {
    ...commonTransactionProps,
    transactionType: 'expense',
    accountId: body.accountExpenseId,
  };

  const commonIncomeTransactionProps = {
    ...commonTransactionProps,
    transactionType: 'income',
    accountId: body.accountIncomeId,
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
      },
    };
  } else {
    return {
      expenseTransactionProps:
        commonExpenseTransactionProps as TransactionTransferUpdateProps,
      incomeTransactionProps:
        commonIncomeTransactionProps as TransactionTransferUpdateProps,
    };
  }
}
