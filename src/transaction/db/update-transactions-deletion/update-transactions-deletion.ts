import { ClientSession, FilterQuery, Types } from 'mongoose';

import { UpdateManyReply } from '@shared/http';
import { ITransaction, TransactionDeletion, TransactionModel } from '@transaction/model';
import { withSession } from '@utils/with-session';

type TransactionDeletionUpdate = {
  id: string;
  deletion: TransactionDeletion | null;
};

const createUpdateReply = (
  matchedCount: number,
  modifiedCount: number,
): UpdateManyReply => ({
  acknowledged: true,
  matchedCount,
  modifiedCount,
});

export const updateTransactionsDeletionCore = async (
  session: ClientSession,
  updates: TransactionDeletionUpdate[],
): Promise<UpdateManyReply> => {
  if (!updates.length) return createUpdateReply(0, 0);

  const result = await TransactionModel.bulkWrite(
    updates.map(({ id, deletion }) => ({
      updateOne: {
        filter: { _id: new Types.ObjectId(id) },
        update: { $set: { deletion } },
      },
    })),
    { session },
  );

  return createUpdateReply(result.matchedCount, result.modifiedCount);
};

export const updateTransactionsDeletion = async (
  updates: TransactionDeletionUpdate[],
): Promise<UpdateManyReply> => withSession(updateTransactionsDeletionCore, updates);

export const updateTransactionsDeletionByFilterCore = async (
  session: ClientSession,
  filter: FilterQuery<ITransaction>,
  deletion: TransactionDeletion | null,
): Promise<UpdateManyReply> => {
  const result = await TransactionModel.updateMany(
    filter,
    { $set: { deletion } },
    { session },
  );

  return createUpdateReply(result.matchedCount, result.modifiedCount);
};

export const updateTransactionsDeletionByFilter = async (
  filter: FilterQuery<ITransaction>,
  deletion: TransactionDeletion | null,
): Promise<UpdateManyReply> =>
  withSession(updateTransactionsDeletionByFilterCore, filter, deletion);
