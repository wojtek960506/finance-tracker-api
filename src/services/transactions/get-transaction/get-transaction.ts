import { findTransaction } from "@db/transactions";
import { checkTransactionOwner } from "@services/services-utils";
import { serializeTransaction } from "@schemas/serialize-transaction";


export const getTransaction = async (
  transactionId: string,
  userId: string
) => {
  const transaction = await findTransaction(transactionId);
  checkTransactionOwner(userId, transactionId, transaction.ownerId.toString());
  return serializeTransaction(transaction);
}