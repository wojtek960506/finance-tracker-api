import { checkOwner } from "@services/general";
import { findCategoryById } from "@db/categories";
import { SystemCategoryNotAllowed } from "@utils/errors";
import { updateTransactionPair } from "./update-transaction-pair";
import { findTransaction, saveTransactionChanges } from "@db/transactions";
import { prepareExchangeProps, prepareTransferProps } from "@services/transactions";
import {
  TransactionExchangeDTO,
  TransactionResponseDTO,
  TransactionStandardDTO,
  TransactionTransferDTO,
} from "@schemas/transaction";


export const updateStandardTransaction = async (
  transactionId: string,
  userId: string,
  dto: TransactionStandardDTO,
) => {
  // in case of wrong categoryId the error is thrown and creation is stopped
  const category = await findCategoryById(dto.categoryId);
  if (category.type === "system")
    throw new SystemCategoryNotAllowed(category.id);

  const transaction = await findTransaction(transactionId);
  checkOwner(userId, transactionId, transaction.ownerId, "transaction");

  const updatedTransaction = await saveTransactionChanges(transaction, dto);
  return updatedTransaction;
}

export const updateTransferTransaction = async (
  transactionId: string,
  userId: string,
  dto: TransactionTransferDTO,
): Promise<[TransactionResponseDTO, TransactionResponseDTO]> => {
  return updateTransactionPair(
    transactionId,
    userId,
    "myAccount",
    (objectIds) => prepareTransferProps(dto, objectIds),
  );
}

export const updateExchangeTransaction = async (
  transactionId: string,
  userId: string,
  dto: TransactionExchangeDTO,
): Promise<[TransactionResponseDTO, TransactionResponseDTO]> => {
  return updateTransactionPair(
    transactionId,
    userId,
    "exchange",
    (objectIds) => prepareExchangeProps(dto, objectIds),
  );
}
