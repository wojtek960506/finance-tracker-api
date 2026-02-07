import { TransactionModel } from "@models/transaction-model";


type RemoveQuery = { ownerId?: string }

export const removeTransactions = async (ownerId?: string) => {
  const query: RemoveQuery = {};
  if (ownerId !== undefined) query.ownerId = ownerId;
  return TransactionModel.deleteMany(query);
}
