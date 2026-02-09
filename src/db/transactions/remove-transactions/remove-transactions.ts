import { DeleteManyReply } from "@routes/routes-types";
import { TransactionModel } from "@models/transaction-model";


type RemoveQuery = { ownerId?: string }

export const removeTransactions = async (ownerId?: string): Promise<DeleteManyReply> => {
  const query: RemoveQuery = {};
  if (ownerId !== undefined) query.ownerId = ownerId;
  return TransactionModel.deleteMany(query);
}
