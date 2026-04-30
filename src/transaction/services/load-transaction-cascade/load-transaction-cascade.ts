import { checkOwner } from '@shared/services';
import {
  findTransaction,
  FindTransactionOptions,
  TransactionDeletionState,
} from '@transaction/db';

type LoadTransactionCascadeOptions = FindTransactionOptions & {
  deletionState?: TransactionDeletionState;
};

export const loadOwnedTransactionCascade = async (
  transactionId: string,
  userId: string,
  options: LoadTransactionCascadeOptions = {},
) => {
  const transaction = await findTransaction(transactionId, options);
  checkOwner(userId, transactionId, transaction.ownerId, 'transaction');

  if (!transaction.refId) {
    return {
      transaction,
      reference: undefined,
      ids: [transaction._id.toString()],
    };
  }

  const referenceId = transaction.refId.toString();
  const reference = await findTransaction(referenceId, options);
  checkOwner(userId, referenceId, reference.ownerId, 'transaction');

  return {
    transaction,
    reference,
    ids: [transaction._id.toString(), referenceId],
  };
};
