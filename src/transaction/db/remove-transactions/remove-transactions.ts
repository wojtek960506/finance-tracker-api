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
  return TransactionModel.deleteMany(query);
};
