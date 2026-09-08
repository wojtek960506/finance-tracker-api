import { InvestmentOperationModel } from '@investment/model';

import { DeleteManyReply } from '@shared/http';
import { TransactionDeletionState } from '@transaction/db/find-transaction';
import { TransactionModel } from '@transaction/model';

type RemoveQuery = {
  ownerId?: string;
  deletion?: null;
  'deletion.deletedAt'?: { $exists: true };
};

export const removeTransactions = async (
  ownerId?: string,
  deletionState: TransactionDeletionState = 'any',
): Promise<DeleteManyReply> => {
  const query: RemoveQuery = {};
  if (ownerId !== undefined) query.ownerId = ownerId;
  if (deletionState === 'active') query.deletion = null;
  if (deletionState === 'trash') query['deletion.deletedAt'] = { $exists: true };

  const transactionsToDelete = await TransactionModel.find(query, { _id: 1 });
  const idsToDelete = transactionsToDelete.map((t) => t._id);

  if (idsToDelete.length > 0) {
    await InvestmentOperationModel.deleteMany({ transactionId: { $in: idsToDelete } });
  }

  return TransactionModel.deleteMany(query);
};
