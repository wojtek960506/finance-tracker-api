import { checkTransactionOwner } from "@services/services-utils";
import { TransactionCreateStandardDTO } from "@schemas/transaction";
import { findTransaction, saveStandardTransactionChanges } from "@db/transactions";


export const updateStandardTransaction = async (
  transactionId: string,
  userId: string,
  dto: TransactionCreateStandardDTO,
) => {
  const transaction = await findTransaction(transactionId);
  checkTransactionOwner(userId, transactionId, transaction.ownerId.toString());

  const updatedTransaction = await saveStandardTransactionChanges(transaction, dto);
  return updatedTransaction;
}