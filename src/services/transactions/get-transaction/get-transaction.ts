import { checkOwner } from "@services/general";
import { findTransaction } from "@db/transactions";
import { serializeTransaction } from "@schemas/serializers";


export const getTransaction = async (
  transactionId: string,
  userId: string
) => {
  const transaction = await findTransaction(transactionId);
  checkOwner(userId, transactionId, transaction.ownerId, "transaction");
  await transaction.populate([
    { path: "categoryId", select: '_id type name' }
  ]);

  return serializeTransaction(transaction);
}
