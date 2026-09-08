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
  resolveAccountId,
  resolveCategoryId,
  resolvePaymentMethodId,
} from '@transaction/services/resolve-transaction-resource-id';

import { createTransactionPair } from './create-transaction-pair';

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
    kind: 'standard',
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
  const [accountExpenseId, accountIncomeId, paymentMethodId] = await Promise.all([
    resolveAccountId(dto.accountExpenseId, ownerId),
    resolveAccountId(dto.accountIncomeId, ownerId),
    resolvePaymentMethodId(dto.paymentMethodId, ownerId),
  ]);
  return createTransactionPair(ownerId, 'exchange', (objectIds, context) =>
    prepareExchangeProps(
      { ...dto, accountExpenseId, accountIncomeId, paymentMethodId },
      objectIds,
      context,
    ),
  );
};
