import { startSession } from "mongoose";
import { findTransaction } from "@db/transactions";
import { prepareExchangeProps } from "@services/transactions";
import { checkTransactionOwner } from "@services/services-utils";
import { serializeTransaction } from "@schemas/serialize-transaction";
import { TransactionResponseDTO, TransactionUpdateExchangeDTO } from "@schemas/transaction";
import {
  TransactionWrongTypesError,
  TransactionWrongReferenceError,
  TransactionExchangeCategoryError,
  TransactionMissingReferenceError,
} from "@utils/errors";


export const updateExchangeTransaction = async (
  transactionId: string,
  userId: string,
  dto: TransactionUpdateExchangeDTO,
): Promise<[TransactionResponseDTO, TransactionResponseDTO]> => {
  const transaction = await findTransaction(transactionId);
  checkTransactionOwner(userId, transactionId, transaction.ownerId.toString());
  if (transaction.category !== "exchange")
    throw new TransactionExchangeCategoryError(transactionId);
  if (transaction.refId === undefined)
    throw new TransactionMissingReferenceError(transactionId);

  const transactionRef = await findTransaction(transaction.refId!.toString());
  checkTransactionOwner(userId, transactionRef.id, transactionRef.ownerId.toString());
  if (transactionRef.category !== "exchange")
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
  } = prepareExchangeProps(dto);

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