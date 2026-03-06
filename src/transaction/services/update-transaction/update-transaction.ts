import { findCategoryById } from '@category/db';
import { findPaymentMethodById } from '@payment-method/db';
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

export const updateStandardTransaction = async (
  transactionId: string,
  userId: string,
  dto: TransactionStandardDTO,
) => {
  // in case of wrong categoryId the error is thrown and creation is stopped
  const category = await findCategoryById(dto.categoryId);
  if (category.type === 'system') throw new SystemCategoryNotAllowed(category.id);
  const paymentMethod = await findPaymentMethodById(dto.paymentMethodId);
  if (paymentMethod.type !== 'system')
    checkOwner(userId, paymentMethod.id, paymentMethod.ownerId!, 'paymentMethod');

  const transaction = await findTransaction(transactionId);
  checkOwner(userId, transactionId, transaction.ownerId, 'transaction');

  return saveTransactionChanges(transaction, dto);
};

export const updateTransferTransaction = async (
  transactionId: string,
  userId: string,
  dto: TransactionTransferDTO,
): Promise<[TransactionResponseDTO, TransactionResponseDTO]> => {
  return updateTransactionPair(transactionId, userId, 'myAccount', (objectIds) =>
    prepareTransferProps(dto, objectIds),
  );
};

export const updateExchangeTransaction = async (
  transactionId: string,
  userId: string,
  dto: TransactionExchangeDTO,
): Promise<[TransactionResponseDTO, TransactionResponseDTO]> => {
  return updateTransactionPair(transactionId, userId, 'exchange', (objectIds) =>
    prepareExchangeProps(dto, objectIds),
  );
};
