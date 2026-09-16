import { UpdateManyReply } from '@shared/http';
import { updateTransactionsDeletion } from '@transaction/db';

import { loadOwnedTransactionCascade } from '../load-transaction-cascade';
import { buildTransactionDeletion } from '../trash-helpers';

export const deleteTransaction = async (
  transactionId: string,
  userId: string,
): Promise<UpdateManyReply> => {
  const { ids } = await loadOwnedTransactionCascade(transactionId, userId);
  const deletion = buildTransactionDeletion();
  return updateTransactionsDeletion(
    ids.map((id) => ({ id, deletion })),
    ids.length,
  );
};
