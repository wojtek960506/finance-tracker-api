import { DeleteManyReply } from '@shared/http';
import { removeTransaction } from '@transaction/db';

import { loadOwnedTransactionCascade } from '../load-transaction-cascade';

export const deleteTrashedTransaction = async (
  transactionId: string,
  userId: string,
): Promise<DeleteManyReply> => {
  const { reference, transaction } = await loadOwnedTransactionCascade(
    transactionId,
    userId,
    {
      deletionState: 'trash',
    },
  );

  return removeTransaction(transaction._id.toString(), reference?._id.toString());
};
