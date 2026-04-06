import { findNamedResourceById } from '@named-resource/db';
import { checkOwner } from '@shared/services';
import { findTransaction, saveTransactionChanges } from '@transaction/db';
import {
  TransactionExchangeDTO,
  TransactionResponseDTO,
  TransactionStandardDTO,
  TransactionTransferDTO,
} from '@transaction/schema';
import { prepareExchangeProps, prepareTransferProps } from '@transaction/services';
import { SystemCategoryNotAllowed } from '@utils/errors';

import { updateTransactionPair } from './update-transaction-pair';

const ensureCategoryAllowed = async (categoryId: string, ownerId: string) => {
  const category = await findNamedResourceById('category', categoryId);
  if (category.type === 'system') throw new SystemCategoryNotAllowed(category.id);
  checkOwner(ownerId, category.id, category.ownerId!, 'category');
  return category;
};

const ensurePaymentMethodAllowed = async (paymentMethodId: string, ownerId: string) => {
  const paymentMethod = await findNamedResourceById('paymentMethod', paymentMethodId);
  if (paymentMethod.type !== 'system')
    checkOwner(ownerId, paymentMethod.id, paymentMethod.ownerId!, 'paymentMethod');
  return paymentMethod;
};

const ensureAccountAllowed = async (accountId: string, ownerId: string) => {
  const account = await findNamedResourceById('account', accountId);
  if (account.type !== 'system')
    checkOwner(ownerId, account.id, account.ownerId!, 'account');
  return account;
};

export const updateStandardTransaction = async (
  transactionId: string,
  ownerId: string,
  dto: TransactionStandardDTO,
) => {
  await ensureCategoryAllowed(dto.categoryId, ownerId);
  await ensurePaymentMethodAllowed(dto.paymentMethodId, ownerId);
  await ensureAccountAllowed(dto.accountId, ownerId);

  const transaction = await findTransaction(transactionId);
  checkOwner(ownerId, transactionId, transaction.ownerId, 'transaction');

  return saveTransactionChanges(transaction, dto);
};

export const updateTransferTransaction = async (
  transactionId: string,
  ownerId: string,
  dto: TransactionTransferDTO,
): Promise<[TransactionResponseDTO, TransactionResponseDTO]> => {
  const [accountExpense, accountIncome] = await Promise.all([
    ensureAccountAllowed(dto.accountExpenseId, ownerId),
    ensureAccountAllowed(dto.accountIncomeId, ownerId),
  ]);
  await ensurePaymentMethodAllowed(dto.paymentMethodId, ownerId);
  return updateTransactionPair(transactionId, ownerId, 'myAccount', (objectIds) =>
    prepareTransferProps(dto, objectIds, {
      accountExpenseName: accountExpense.name,
      accountIncomeName: accountIncome.name,
    }),
  );
};

export const updateExchangeTransaction = async (
  transactionId: string,
  ownerId: string,
  dto: TransactionExchangeDTO,
): Promise<[TransactionResponseDTO, TransactionResponseDTO]> => {
  await ensureAccountAllowed(dto.accountId, ownerId);
  await ensurePaymentMethodAllowed(dto.paymentMethodId, ownerId);
  return updateTransactionPair(transactionId, ownerId, 'exchange', (objectIds) =>
    prepareExchangeProps(dto, objectIds),
  );
};
