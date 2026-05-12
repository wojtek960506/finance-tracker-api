import { findNamedResourceById, findNamedResourceByName } from '@named-resource/db';
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
import {
  OTHER_ACCOUNT_NAME,
  OTHER_CATEGORY_NAME,
  OTHER_PAYMENT_METHOD_NAME,
} from '@utils/consts';
import { CategoryNotFoundError, SystemCategoryNotAllowed } from '@utils/errors';

import { createTransactionPair } from './create-transaction-pair';

type OptionalObjectId = string | null | undefined;

const findRequiredSystemResource = async (
  kind: 'category' | 'paymentMethod' | 'account',
  systemName: string,
) => {
  const resource = await findNamedResourceByName(kind, systemName);
  if (!resource && kind === 'category') throw new CategoryNotFoundError(undefined, systemName);
  if (!resource) throw new Error(`Missing required system ${kind}: '${systemName}'`);
  return resource;
};

const resolveCategoryId = async (categoryId: OptionalObjectId, ownerId: string) => {
  const category = categoryId
    ? await findNamedResourceById('category', categoryId)
    : await findRequiredSystemResource('category', OTHER_CATEGORY_NAME);

  if (category.type === 'system' && category.name !== OTHER_CATEGORY_NAME)
    throw new SystemCategoryNotAllowed(category.id);
  if (category.type !== 'system') checkOwner(ownerId, category.id, category.ownerId!, 'category');
  return category.id;
};

const resolvePaymentMethodId = async (
  paymentMethodId: OptionalObjectId,
  ownerId: string,
) => {
  const paymentMethod = paymentMethodId
    ? await findNamedResourceById('paymentMethod', paymentMethodId)
    : await findRequiredSystemResource('paymentMethod', OTHER_PAYMENT_METHOD_NAME);
  if (paymentMethod.type !== 'system')
    checkOwner(ownerId, paymentMethod.id, paymentMethod.ownerId!, 'paymentMethod');
  return paymentMethod.id;
};

const resolveAccountId = async (accountId: OptionalObjectId, ownerId: string) => {
  const account = accountId
    ? await findNamedResourceById('account', accountId)
    : await findRequiredSystemResource('account', OTHER_ACCOUNT_NAME);
  if (account.type !== 'system')
    checkOwner(ownerId, account.id, account.ownerId!, 'account');
  return account.id;
};

export const createStandardTransaction = async (
  dto: TransactionStandardDTO,
  ownerId: string,
): Promise<TransactionResponseDTO> => {
  const [categoryId, paymentMethodId, accountId] = await Promise.all([
    resolveCategoryId(dto.categoryId, ownerId),
    resolvePaymentMethodId(dto.paymentMethodId, ownerId),
    resolveAccountId(dto.accountId, ownerId),
  ]);

  const sourceIndex = await getNextSourceIndex(ownerId);
  return persistTransaction({
    ...dto,
    categoryId,
    paymentMethodId,
    accountId,
    ownerId,
    sourceIndex,
  });
};

export const createTransferTransaction = async (
  dto: TransactionTransferDTO,
  ownerId: string,
): Promise<[TransactionResponseDTO, TransactionResponseDTO]> => {
  const [accountExpenseId, accountIncomeId, paymentMethodId] = await Promise.all([
    resolveAccountId(dto.accountExpenseId, ownerId),
    resolveAccountId(dto.accountIncomeId, ownerId),
    resolvePaymentMethodId(dto.paymentMethodId, ownerId),
  ]);
  return createTransactionPair(ownerId, 'myAccount', (objectIds, context) =>
    prepareTransferProps(
      {
        ...dto,
        accountExpenseId,
        accountIncomeId,
        paymentMethodId,
      },
      objectIds,
      context,
    ),
  );
};

export const createExchangeTransaction = async (
  dto: TransactionExchangeDTO,
  ownerId: string,
): Promise<[TransactionResponseDTO, TransactionResponseDTO]> => {
  const [accountId, paymentMethodId] = await Promise.all([
    resolveAccountId(dto.accountId, ownerId),
    resolvePaymentMethodId(dto.paymentMethodId, ownerId),
  ]);
  return createTransactionPair(ownerId, 'exchange', (objectIds, context) =>
    prepareExchangeProps({ ...dto, accountId, paymentMethodId }, objectIds, context),
  );
};
