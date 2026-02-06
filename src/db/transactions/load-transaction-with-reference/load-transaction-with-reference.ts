import { checkOwner } from "@services/general";
import { findTransaction } from "@db/transactions/find-transaction";
import {
  TransactionWrongTypesError,
  TransactionWrongReferenceError,
  TransactionExchangeCategoryError,
  TransactionMissingReferenceError,
  TransactionTransferCategoryError,
} from "@utils/errors";


export type SystemCategoryName = "exchange" | "myAccount";

export const loadTransactionWithReference = async (
  transactionId: string,
  userId: string,
  expectedCategoryId: string,
  expectedCategoryName: SystemCategoryName,
) => {
  const transaction = await findTransaction(transactionId);
  checkOwner(userId, transactionId, transaction.ownerId, "transaction");

  if (transaction.categoryId.toString() !== expectedCategoryId) {
    if (expectedCategoryName === "myAccount")
      throw new TransactionTransferCategoryError(transactionId);
    else
      throw new TransactionExchangeCategoryError(transactionId);
  }
  
  if (transaction.refId === undefined)
    throw new TransactionMissingReferenceError(transactionId);

  const transactionRef = await findTransaction(transaction.refId!.toString());
  
  const transactionRefId = transactionRef._id.toString();
  
  checkOwner(userId, transactionRefId, transactionRef.ownerId, "transaction");

  if (transactionRef.categoryId.toString() !== expectedCategoryId) {
    if (expectedCategoryName === "myAccount")
      throw new TransactionTransferCategoryError(transactionRefId);
    else
      throw new TransactionExchangeCategoryError(transactionRefId);
  }

  if (transactionRef.refId === undefined)
    throw new TransactionMissingReferenceError(transactionRefId);

  if (transactionRef.refId.toString() !== transactionId)
    throw new TransactionWrongReferenceError(
      transactionRefId,
      transactionRef.refId.toString(),
    );

  if (transactionRef.transactionType === transaction.transactionType)
    throw new TransactionWrongTypesError(
      transactionId,
      transactionRefId,
    );

  return { transaction, transactionRef }
}
