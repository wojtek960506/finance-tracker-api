import { InvestmentOperationModel } from '@investment/model';
import { ClientSession, FilterQuery, Types } from 'mongoose';

import { UpdateManyReply } from '@shared/http';
import { ITransaction, TransactionDeletion, TransactionModel } from '@transaction/model';
import { NotFoundError } from '@utils/errors';
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
  expectedCount?: number,
): Promise<UpdateManyReply> => {
  if (!updates.length) return createUpdateReply(0, 0);

  const targetCount = expectedCount ?? updates.length;

  const result = await TransactionModel.bulkWrite(
    updates.map(({ id, deletion }) => ({
      updateOne: {
        filter: { _id: new Types.ObjectId(id) },
        update: { $set: { deletion } },
      },
    })),
    { session },
  );

  if (result.matchedCount !== targetCount) {
    throw new NotFoundError(
      `Transaction(s) updated - ${result.matchedCount}. ` +
        `Expected to update - ${targetCount}.`,
    );
  }

  await InvestmentOperationModel.bulkWrite(
    updates.map(({ id, deletion }) => ({
      updateMany: {
        filter: { transactionId: new Types.ObjectId(id) },
        update: { $set: { deletion } },
      },
    })),
    { session },
  );

  return createUpdateReply(result.matchedCount, result.modifiedCount);
};

export const updateTransactionsDeletion = async (
  updates: TransactionDeletionUpdate[],
  expectedCount?: number,
): Promise<UpdateManyReply> =>
  withSession(updateTransactionsDeletionCore, updates, expectedCount);

export const updateTransactionsDeletionByFilterCore = async (
  session: ClientSession,
  filter: FilterQuery<ITransaction>,
  deletion: TransactionDeletion | null,
): Promise<UpdateManyReply> => {
  const transactionsToUpdate = await TransactionModel.find(
    filter,
    { _id: 1 },
    { session },
  );
  const ids = transactionsToUpdate.map((t) => t._id);

  if (ids.length > 0) {
    await InvestmentOperationModel.updateMany(
      { transactionId: { $in: ids } },
      { $set: { deletion } },
      { session },
    );
  }

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
