import { checkTransactionOwner } from "@services/services-utils";
import { findTransaction } from "@db/transactions/find-transaction";
import {
  TransactionWrongTypesError,
  TransactionWrongReferenceError,
  TransactionExchangeCategoryError,
  TransactionMissingReferenceError,
  TransactionTransferCategoryError,
} from "@utils/errors";


type TransactionCategory = "exchange" | "myAccount";

export const loadTransactionWithReference = async (
  transactionId: string,
  userId: string,
  expectedCategory: TransactionCategory,
) => {
  const transaction = await findTransaction(transactionId);
  checkTransactionOwner(userId, transactionId, transaction.ownerId.toString());

  if (transaction.category !== expectedCategory) {
    if (expectedCategory === "myAccount")
      throw new TransactionTransferCategoryError(transactionId);
    else
      throw new TransactionExchangeCategoryError(transactionId);
  }
  
  if (transaction.refId === undefined)
    throw new TransactionMissingReferenceError(transactionId);

  const transactionRef = await findTransaction(transaction.refId!.toString());
  checkTransactionOwner(userId, transactionRef.id, transactionRef.ownerId.toString());

  if (transactionRef.category !== expectedCategory) {
    if (expectedCategory === "myAccount")
      throw new TransactionTransferCategoryError(transactionRef.id);
    else
      throw new TransactionExchangeCategoryError(transactionRef.id);
  }

  if (transactionRef.refId === undefined)
    throw new TransactionMissingReferenceError(transactionRef.id);

  if (transactionRef.refId.toString() !== transactionId)
    throw new TransactionWrongReferenceError(
      transactionRef.id.toString(),
      transactionRef.refId.toString(),
    )

  if (transactionRef.transactionType === transaction.transactionType)
    throw new TransactionWrongTypesError(
      transactionId,
      transactionRef.id.toString()
    )

  return { transaction, transactionRef }
}