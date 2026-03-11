import { TransactionExchangeUpdateProps } from '@transaction/db';
import { TransactionExchangeCreateProps } from '@transaction/db/persist-transaction';
import { TransactionExchangeDTO } from '@transaction/schema';
import {
  PrepareTransactionPropsContext,
  PrepareTransactionPropsObjectIds,
} from '@transaction/services/types';

import { prepareExchangeSpecificProps } from './prepare-exchange-specific-props';

export function prepareExchangeProps(
  dto: TransactionExchangeDTO,
  objectIds: PrepareTransactionPropsObjectIds,
  additionalProps: PrepareTransactionPropsContext,
): {
  expenseTransactionProps: TransactionExchangeCreateProps;
  incomeTransactionProps: TransactionExchangeCreateProps;
};
export function prepareExchangeProps(
  dto: TransactionExchangeDTO,
  objectIds: PrepareTransactionPropsObjectIds,
): {
  expenseTransactionProps: TransactionExchangeUpdateProps;
  incomeTransactionProps: TransactionExchangeUpdateProps;
};
export function prepareExchangeProps(
  dto: TransactionExchangeDTO,
  objectIds: PrepareTransactionPropsObjectIds,
  additionalProps?: PrepareTransactionPropsContext,
) {
  const { description, currencies, exchangeRate } = prepareExchangeSpecificProps(dto);
  const { categoryId } = objectIds;

  // TODO - probably paymentMethodId has to be placed in 'objectIds`
  const commonTransactionProps = {
    categoryId,
    date: dto.date,
    accountId: dto.accountId,
    paymentMethodId: dto.paymentMethodId,
    description,
    currencies,
    exchangeRate,
  };

  const commonExpenseTransactionProps = {
    ...commonTransactionProps,
    transactionType: 'expense',
    amount: dto.amountExpense,
    currency: dto.currencyExpense,
  };

  const commonIncomeTransactionProps = {
    ...commonTransactionProps,
    transactionType: 'income',
    amount: dto.amountIncome,
    currency: dto.currencyIncome,
  };

  if (additionalProps) {
    const { ownerId, sourceIndexExpense, sourceIndexIncome } = additionalProps;
    return {
      expenseTransactionProps: {
        ...commonExpenseTransactionProps,
        ownerId,
        sourceIndex: sourceIndexExpense,
        sourceRefIndex: sourceIndexIncome,
      } as TransactionExchangeCreateProps,
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
        commonExpenseTransactionProps as TransactionExchangeUpdateProps,
      incomeTransactionProps:
        commonIncomeTransactionProps as TransactionExchangeUpdateProps,
    };
  }
}
