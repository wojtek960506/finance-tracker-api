import { Types } from 'mongoose';

import { UpdateManyReply } from '@shared/http';
import { updateTransactionsDeletion } from '@transaction/db';
import { TransactionModel } from '@transaction/model';

import { buildTransactionDeletion } from '../trash-helpers';

export const deleteTransactions = async (ownerId: string): Promise<UpdateManyReply> => {
  const deletedAt = new Date();
  const transactions = await TransactionModel.find({
    ownerId: new Types.ObjectId(ownerId),
    deletion: null,
  }).select('_id refId');

  return updateTransactionsDeletion(
    transactions.map((transaction) => ({
      id: transaction._id.toString(),
      deletion: buildTransactionDeletion(deletedAt),
    })),
  );
};
