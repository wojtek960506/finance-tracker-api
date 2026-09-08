import { InvestmentInstrumentModel } from '@investment/model';

import {
  TransactionInvestmentCreateProps,
  TransactionStandardCreateProps,
} from '@transaction/db';
import {
  TransactionBulkItemInvestmentDTO,
  TransactionExchangeDTO,
  TransactionStandardDTO,
  TransactionTransferDTO,
} from '@transaction/schema';
import { prepareExchangeProps } from '@transaction/services/prepare-exchange-props';
import { prepareTransferProps } from '@transaction/services/prepare-transfer-props';
import {
  resolveAccountId,
  resolveCategoryId,
  resolvePaymentMethodId,
} from '@transaction/services/resolve-transaction-resource-id';
import { InvestmentInstrumentNotFoundError } from '@utils/errors';

import { resolveSystemCategoryId } from './resolve-system-category-id';
import { TransactionKindObjectIds } from './types';

export const prepareBulkStandardTransaction = async (
  dto: TransactionStandardDTO,
  ownerId: string,
  sourceIndex: number,
) => {
  const [categoryId, paymentMethodId, accountId] = await Promise.all([
    resolveCategoryId(dto.categoryId, ownerId),
    resolvePaymentMethodId(dto.paymentMethodId, ownerId),
    resolveAccountId(dto.accountId, ownerId),
  ]);

  return {
    ...dto,
    kind: 'standard',
    categoryId,
    paymentMethodId,
    accountId,
    ownerId,
    sourceIndex,
  } satisfies TransactionStandardCreateProps;
};

export const prepareBulkTransferTransactions = async (
  dto: TransactionTransferDTO,
  ownerId: string,
  sourceIndices: [number, number],
  objectIds: TransactionKindObjectIds,
) => {
  const [accountExpenseId, accountIncomeId, paymentMethodId] = await Promise.all([
    resolveAccountId(dto.accountExpenseId, ownerId),
    resolveAccountId(dto.accountIncomeId, ownerId),
    resolvePaymentMethodId(dto.paymentMethodId, ownerId),
  ]);

  const { expenseTransactionProps, incomeTransactionProps } = prepareTransferProps(
    {
      ...dto,
      accountExpenseId,
      accountIncomeId,
      paymentMethodId,
    },
    { categoryId: objectIds.transferCategoryId! },
    {
      ownerId,
      sourceIndexExpense: sourceIndices[0],
      sourceIndexIncome: sourceIndices[1],
    },
  );

  return [expenseTransactionProps, incomeTransactionProps];
};

export const prepareBulkExchangeTransactions = async (
  dto: TransactionExchangeDTO,
  ownerId: string,
  sourceIndices: [number, number],
  objectIds: TransactionKindObjectIds,
) => {
  const [accountExpenseId, accountIncomeId, paymentMethodId] = await Promise.all([
    resolveAccountId(dto.accountExpenseId, ownerId),
    resolveAccountId(dto.accountIncomeId, ownerId),
    resolvePaymentMethodId(dto.paymentMethodId, ownerId),
  ]);

  const { expenseTransactionProps, incomeTransactionProps } = prepareExchangeProps(
    {
      ...dto,
      accountExpenseId,
      accountIncomeId,
      paymentMethodId,
    },
    { categoryId: objectIds.exchangeCategoryId! },
    {
      ownerId,
      sourceIndexExpense: sourceIndices[0],
      sourceIndexIncome: sourceIndices[1],
    },
  );

  return [expenseTransactionProps, incomeTransactionProps];
};

export const prepareBulkInvestmentTransaction = async (
  dto: TransactionBulkItemInvestmentDTO,
  ownerId: string,
  sourceIndex: number,
  objectIds: TransactionKindObjectIds,
) => {
  const [categoryId, paymentMethodId, accountId] = await Promise.all([
    dto.categoryId
      ? resolveCategoryId(dto.categoryId, ownerId)
      : (objectIds.investmentCategoryId ??= await resolveSystemCategoryId('investment')),
    resolvePaymentMethodId(dto.paymentMethodId, ownerId),
    resolveAccountId(dto.accountId, ownerId),
  ]);

  const instrument = await InvestmentInstrumentModel.findOne({
    _id: dto.investment.instrumentId,
    ownerId,
  });

  if (!instrument) {
    throw new InvestmentInstrumentNotFoundError(dto.investment.instrumentId);
  }

  const transactionType =
    dto.transactionType ??
    (dto.investment.operationKind === 'buy' || dto.investment.operationKind === 'fee'
      ? 'expense'
      : 'income');

  return {
    ...dto,
    kind: 'investment',
    transactionType,
    categoryId,
    paymentMethodId,
    accountId,
    ownerId,
    sourceIndex,
  } satisfies TransactionInvestmentCreateProps;
};
