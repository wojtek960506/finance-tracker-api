import { UpdateManyReply } from '@shared/http';
import { updateTransactionsDeletion } from '@transaction/db';
import { NotFoundError } from '@utils/errors';

import { loadOwnedTransactionCascade } from '../load-transaction-cascade';
import { buildTransactionDeletion } from '../trash-helpers';

export const deleteTransaction = async (
  transactionId: string,
  userId: string,
): Promise<UpdateManyReply> => {
  const { ids } = await loadOwnedTransactionCascade(transactionId, userId);
  const deletion = buildTransactionDeletion();
  const result = await updateTransactionsDeletion(ids.map((id) => ({ id, deletion })));

  if (result.matchedCount !== ids.length) {
    throw new NotFoundError(
      `Transaction(s) moved to trash - ${result.matchedCount}. ` +
        `Expected to move - ${ids.length}.`,
    );
  }

  return result;
};
