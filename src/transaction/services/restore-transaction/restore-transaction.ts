import { UpdateManyReply } from '@shared/http';
import { updateTransactionsDeletion } from '@transaction/db';

import { loadOwnedTransactionCascade } from '../load-transaction-cascade';

export const restoreTransaction = async (
  transactionId: string,
  userId: string,
): Promise<UpdateManyReply> => {
  const { ids } = await loadOwnedTransactionCascade(transactionId, userId, {
    deletionState: 'trash',
  });
  return updateTransactionsDeletion(
    ids.map((id) => ({ id, deletion: null })),
    ids.length,
  );
};
