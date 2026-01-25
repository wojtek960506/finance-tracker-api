import { checkTransactionOwner } from "@services/services-utils";
import { TransactionStandardDTO } from "@schemas/transaction";
import { findTransaction, saveStandardTransactionChanges } from "@db/transactions";


export const updateStandardTransaction = async (
  transactionId: string,
  userId: string,
  dto: TransactionStandardDTO,
) => {
  const transaction = await findTransaction(transactionId);
  checkTransactionOwner(userId, transactionId, transaction.ownerId.toString());

  const updatedTransaction = await saveStandardTransactionChanges(transaction, dto);
  return updatedTransaction;
}