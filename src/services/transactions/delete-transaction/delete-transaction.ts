import { checkTransactionOwner } from "@services/transactions";
import { findTransaction, removeTransaction } from "@db/transactions";


export const deleteTransaction = async (
  transactionId: string,
  userId: string,
) => {
  const transaction = await findTransaction(transactionId);
  checkTransactionOwner(userId, transactionId, transaction.ownerId.toString());
  return removeTransaction(transactionId, transaction.refId?.toString());
}