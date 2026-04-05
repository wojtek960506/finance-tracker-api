import { findNamedResourceById } from '@shared/named-resource/db';
import { checkOwner } from '@shared/services';
import { persistTransaction } from '@transaction/db';
import {
  TransactionExchangeDTO,
  TransactionResponseDTO,
  TransactionStandardDTO,
  TransactionTransferDTO,
} from '@transaction/schema';
import {
  getNextSourceIndex,
  prepareExchangeProps,
  prepareTransferProps,
} from '@transaction/services';
import { SystemCategoryNotAllowed } from '@utils/errors';

import { createTransactionPair } from './create-transaction-pair';

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

export const createStandardTransaction = async (
  dto: TransactionStandardDTO,
  ownerId: string,
): Promise<TransactionResponseDTO> => {
  await ensureCategoryAllowed(dto.categoryId, ownerId);
  await ensurePaymentMethodAllowed(dto.paymentMethodId, ownerId);
  await ensureAccountAllowed(dto.accountId, ownerId);

  const sourceIndex = await getNextSourceIndex(ownerId);
  return persistTransaction({ ...dto, ownerId, sourceIndex });
};

export const createTransferTransaction = async (
  dto: TransactionTransferDTO,
  ownerId: string,
): Promise<[TransactionResponseDTO, TransactionResponseDTO]> => {
  const [accountExpense, accountIncome] = await Promise.all([
    ensureAccountAllowed(dto.accountExpenseId, ownerId),
    ensureAccountAllowed(dto.accountIncomeId, ownerId),
  ]);
  await ensurePaymentMethodAllowed(dto.paymentMethodId, ownerId);
  return createTransactionPair(ownerId, 'myAccount', (objectIds, context) =>
    prepareTransferProps(dto, objectIds, {
      ...context,
      accountExpenseName: accountExpense.name,
      accountIncomeName: accountIncome.name,
    }),
  );
};

export const createExchangeTransaction = async (
  dto: TransactionExchangeDTO,
  ownerId: string,
): Promise<[TransactionResponseDTO, TransactionResponseDTO]> => {
  await ensureAccountAllowed(dto.accountId, ownerId);
  await ensurePaymentMethodAllowed(dto.paymentMethodId, ownerId);
  return createTransactionPair(ownerId, 'exchange', (objectIds, context) =>
    prepareExchangeProps(dto, objectIds, context),
  );
};
