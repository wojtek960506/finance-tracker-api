import { checkOwner } from '@shared/services';
import { findTransaction, saveTransactionChanges } from '@transaction/db';
import {
  TransactionExchangeDTO,
  TransactionResponseDTO,
  TransactionStandardDTO,
  TransactionTransferDTO,
} from '@transaction/schema';
import { prepareExchangeProps, prepareTransferProps } from '@transaction/services';
import {
  resolveAccountId,
  resolveCategoryId,
  resolvePaymentMethodId,
} from '@transaction/services/resolve-transaction-resource-id';

import { updateTransactionPair } from './update-transaction-pair';

export const updateStandardTransaction = async (
  transactionId: string,
  ownerId: string,
  dto: TransactionStandardDTO,
) => {
  const [categoryId, paymentMethodId, accountId] = await Promise.all([
    resolveCategoryId(dto.categoryId, ownerId),
    resolvePaymentMethodId(dto.paymentMethodId, ownerId),
    resolveAccountId(dto.accountId, ownerId),
  ]);

  const transaction = await findTransaction(transactionId);
  checkOwner(ownerId, transactionId, transaction.ownerId, 'transaction');

  return saveTransactionChanges(transaction, {
    ...dto,
    categoryId,
    paymentMethodId,
    accountId,
  });
};

export const updateTransferTransaction = async (
  transactionId: string,
  ownerId: string,
  dto: TransactionTransferDTO,
): Promise<[TransactionResponseDTO, TransactionResponseDTO]> => {
  const [accountExpenseId, accountIncomeId, paymentMethodId] = await Promise.all([
    resolveAccountId(dto.accountExpenseId, ownerId),
    resolveAccountId(dto.accountIncomeId, ownerId),
    resolvePaymentMethodId(dto.paymentMethodId, ownerId),
  ]);
  return updateTransactionPair(transactionId, ownerId, 'myAccount', (objectIds) =>
    prepareTransferProps(
      {
        ...dto,
        accountExpenseId,
        accountIncomeId,
        paymentMethodId,
      },
      objectIds,
    ),
  );
};

export const updateExchangeTransaction = async (
  transactionId: string,
  ownerId: string,
  dto: TransactionExchangeDTO,
): Promise<[TransactionResponseDTO, TransactionResponseDTO]> => {
  const [accountExpenseId, accountIncomeId, paymentMethodId] = await Promise.all([
    resolveAccountId(dto.accountExpenseId, ownerId),
    resolveAccountId(dto.accountIncomeId, ownerId),
    resolvePaymentMethodId(dto.paymentMethodId, ownerId),
  ]);
  return updateTransactionPair(transactionId, ownerId, 'exchange', (objectIds) =>
    prepareExchangeProps(
      { ...dto, accountExpenseId, accountIncomeId, paymentMethodId },
      objectIds,
    ),
  );
};
