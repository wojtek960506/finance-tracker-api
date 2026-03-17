import { checkOwner } from '@shared/services';
import { findTransaction } from '@transaction/db';
import { serializeTransaction } from '@transaction/serializers';

export const getTransaction = async (transactionId: string, userId: string) => {
  const transaction = await findTransaction(transactionId);
  checkOwner(userId, transactionId, transaction.ownerId, 'transaction');
  await transaction.populate([
    { path: 'categoryId', select: '_id type name' },
    { path: 'paymentMethodId', select: '_id type name' },
    { path: 'accountId', select: '_id type name' },
  ]);

  return serializeTransaction(transaction);
};
