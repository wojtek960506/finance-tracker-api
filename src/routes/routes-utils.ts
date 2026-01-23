import { ITransaction, TransactionModel } from "@models/transaction-model";
import { AppError, NotFoundError } from "@utils/errors";

export const findTransactionOld = async (id: string) => {
  const transaction = await TransactionModel.findById(id);
  if (!transaction)
    throw new NotFoundError(`Transaction with ID '${id}' not found`);
  return transaction;
}

export const checkOwnerOld = (
  userId: string,
  transaction: ITransaction,
  action: "update" | "delete"
) => {
  if (transaction.ownerId.toString() !== userId)
    throw new AppError(403, `Cannot ${action} transaction which you are not owning`);
}