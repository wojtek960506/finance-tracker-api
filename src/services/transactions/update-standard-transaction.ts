import { TransactionUpdateDTO } from "@schemas/transaction";
import { checkTransactionOwner } from "@services/services-utils";
import { findTransaction, saveStandardTransactionChanges } from "@db/transactions";


export const updateStandardTransaction = async (
  transactionId: string,
  userId: string,
  dto: TransactionUpdateDTO,
) => {
  const transaction = await findTransaction(transactionId);
  checkTransactionOwner(userId, transactionId, transaction.ownerId.toString());

  const updatedTransaction = await saveStandardTransactionChanges(transaction, dto);
  return updatedTransaction;
}