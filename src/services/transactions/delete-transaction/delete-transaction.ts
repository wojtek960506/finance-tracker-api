import { checkOwner } from "@services/general";
import { findTransaction, removeTransaction } from "@db/transactions";


export const deleteTransaction = async (
  transactionId: string,
  userId: string,
) => {
  const transaction = await findTransaction(transactionId);
  checkOwner(userId, transactionId, transaction.ownerId, "transaction");
  return removeTransaction(transactionId, transaction.refId?.toString());
}
