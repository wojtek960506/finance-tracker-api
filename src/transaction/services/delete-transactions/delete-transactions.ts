import { DeleteManyReply } from '@shared/http';
import { removeTransactions } from '@transaction/db';

export const deleteTransactions = async (ownerId: string): Promise<DeleteManyReply> => {
  return removeTransactions(ownerId);
};
