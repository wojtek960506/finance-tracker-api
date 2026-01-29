import { checkTransactionOwner } from "@services/transactions";
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
  const transaction = await findTransaction(transactionId);
  checkTransactionOwner(userId, transactionId, transaction.ownerId.toString());

  const updatedTransaction = await saveTransactionChanges(transaction, dto);
  return updatedTransaction;
}

export const updateTransferTransaction = async (
  transactionId: string,
  userId: string,
  dto: TransactionTransferDTO,
): Promise<[TransactionResponseDTO, TransactionResponseDTO]> => {
  return updateTransactionPair(
    transactionId, userId, "myAccount", () => prepareTransferProps(dto)
  );
}

export const updateExchangeTransaction = async (
  transactionId: string,
  userId: string,
  dto: TransactionExchangeDTO,
): Promise<[TransactionResponseDTO, TransactionResponseDTO]> => {
  return updateTransactionPair(
    transactionId, userId, "exchange", () => prepareExchangeProps(dto)
  );
}