import { checkOwner } from "@shared/services";
import { findTransaction, removeTransaction } from "@transaction/db";


export const deleteTransaction = async (
  transactionId: string,
  userId: string,
) => {
  const transaction = await findTransaction(transactionId);
  checkOwner(userId, transactionId, transaction.ownerId, "transaction");
  return removeTransaction(transactionId, transaction.refId?.toString());
}
