import { UpdateManyReply } from '@shared/http';
import { updateTransactionsDeletion } from '@transaction/db';
import { NotFoundError } from '@utils/errors';

import { loadOwnedTransactionCascade } from '../load-transaction-cascade';

export const restoreTransaction = async (
  transactionId: string,
  userId: string,
): Promise<UpdateManyReply> => {
  const { ids } = await loadOwnedTransactionCascade(transactionId, userId, {
    deletionState: 'trash',
  });
  const result = await updateTransactionsDeletion(
    ids.map((id) => ({ id, deletion: null })),
  );

  if (result.matchedCount !== ids.length) {
    throw new NotFoundError(
      `Transaction(s) restored - ${result.matchedCount}. ` +
        `Expected to restore - ${ids.length}.`,
    );
  }

  return result;
};
