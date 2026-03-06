import { DeleteManyReply } from "@shared/http"
import { TransactionModel } from "@transaction/model"


type RemoveQuery = { ownerId?: string }

export const removeTransactions = async (ownerId?: string): Promise<DeleteManyReply> => {
  const query: RemoveQuery = {};
  if (ownerId !== undefined) query.ownerId = ownerId;
  return TransactionModel.deleteMany(query);
}
