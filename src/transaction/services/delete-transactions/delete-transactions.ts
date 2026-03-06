import { DeleteManyReply } from '@shared/http';
import { removeTransactions } from '@transaction/db';
import { UserModel } from '@user/model';
import { AppError } from '@utils/errors';

export const deleteTransactions = async (ownerId: string): Promise<DeleteManyReply> => {
  // just for easier testing. I think that in final version other users will not have
  // possibility to delete all of their transactions at once
  const user = await UserModel.findById(ownerId);
  if (user?.email !== 'test1@test.com')
    throw new AppError(403, 'Only one particular test user can delete its transactions');
  return removeTransactions(ownerId);
};
