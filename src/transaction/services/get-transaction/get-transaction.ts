import { checkOwner } from '@shared/services';
import {
  findTransaction,
  findTransactionNullable,
  FindTransactionOptions,
} from '@transaction/db';
import { TransactionDetailsResponseDTO } from '@transaction/schema';
import { serializeTransaction } from '@transaction/serializers';

export const populateTransactionRelations = async (transaction: {
  populate: (paths: { path: string; select: string }[]) => Promise<unknown>;
}) => {
  await transaction.populate([
    { path: 'categoryId', select: '_id type name' },
    { path: 'paymentMethodId', select: '_id type name' },
    { path: 'accountId', select: '_id type name' },
  ]);
};

export const loadOwnedTransactionDetails = async (
  transactionId: string,
  userId: string,
  options: FindTransactionOptions = {},
) => {
  const transaction = await findTransaction(transactionId, options);
  checkOwner(userId, transactionId, transaction.ownerId, 'transaction');
  await populateTransactionRelations(transaction);

  if (!transaction.refId) {
    return { transaction, reference: undefined };
  }

  const referenceId = transaction.refId.toString();
  const reference = await findTransactionNullable(referenceId, options);

  if (!reference) {
    return { transaction, reference: undefined };
  }

  checkOwner(userId, referenceId, reference.ownerId, 'transaction');
  await populateTransactionRelations(reference);

  return { transaction, reference };
};

export const getTransaction = async (
  transactionId: string,
  userId: string,
): Promise<TransactionDetailsResponseDTO> => {
  const { transaction, reference } = await loadOwnedTransactionDetails(
    transactionId,
    userId,
  );

  const serialized = serializeTransaction(transaction);

  if (!reference) return serialized;

  return {
    ...serialized,
    reference: serializeTransaction(reference),
  };
};
