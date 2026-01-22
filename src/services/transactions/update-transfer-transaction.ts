import { startSession } from "mongoose";
import { findTransaction } from "@db/transactions";
import { prepareTransferProps } from "@services/transactions";
import { checkTransactionOwner } from "@services/services-utils";
import { TransactionUpdateTransferDTO } from "@schemas/transaction";
import { serializeTransaction } from "@schemas/serialize-transaction";
import {
  TransactionExchangeCategoryError,
  TransactionMissingReferenceError,
  TransactionWrongReferenceError,
  TransactionWrongTypesError,
} from "@utils/errors";



export const updateTransferTransaction = async (
  transactionId: string,
  userId: string,
  dto: TransactionUpdateTransferDTO,
) => {
  const transaction = await findTransaction(transactionId);
  checkTransactionOwner(userId, transactionId, transaction.ownerId.toString());
  if (transaction.category !== "myAccount")
    throw new TransactionExchangeCategoryError(transactionId);
  if (transaction.refId === undefined)
    throw new TransactionMissingReferenceError(transactionId);

  const transactionRef = await findTransaction(transaction.refId!.toString());
  checkTransactionOwner(userId, transactionRef.id, transactionRef.ownerId.toString());
  if (transactionRef.category !== "myAccount")
    throw new TransactionExchangeCategoryError(transactionRef.id);
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

  const {
    expenseTransactionProps,
    incomeTransactionProps,
  } = prepareTransferProps(dto);
  
  const session = await startSession();

  try {
    await session.withTransaction(async () => {
      if (transaction.transactionType === "expense") {
        Object.assign(transaction, expenseTransactionProps);
        Object.assign(transactionRef, incomeTransactionProps);
      } else {
        Object.assign(transactionRef, expenseTransactionProps);
        Object.assign(transaction, incomeTransactionProps);
      }
      await transaction.save();
      await transactionRef.save();
    })
  } finally {
    await session.endSession();
  }

  return [
    serializeTransaction(transaction),
    serializeTransaction(transactionRef),
  ]
}