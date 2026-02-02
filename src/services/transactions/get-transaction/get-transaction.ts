import { checkOwner } from "@services/general";
import { findTransaction } from "@db/transactions";
import { serializeTransaction } from "@schemas/serialize-transaction";


export const getTransaction = async (
  transactionId: string,
  userId: string
) => {
  const transaction = await findTransaction(transactionId);
  checkOwner(userId, transactionId, transaction.ownerId, "transaction");
  return serializeTransaction(transaction);
}
