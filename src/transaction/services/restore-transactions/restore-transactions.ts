import { Types } from 'mongoose';

import { UpdateManyReply } from '@shared/http';
import { updateTransactionsDeletionByFilter } from '@transaction/db';

export const restoreTransactions = async (ownerId: string): Promise<UpdateManyReply> => {
  return updateTransactionsDeletionByFilter(
    {
      ownerId: new Types.ObjectId(ownerId),
      'deletion.deletedAt': { $exists: true },
    },
    null,
  );
};
