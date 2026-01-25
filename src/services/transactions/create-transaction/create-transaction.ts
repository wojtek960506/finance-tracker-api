import { createTransactionPair } from "./create-transaction-pair";
import { persistTransaction } from "@db/transactions/persist-transaction";
import {
  getNextSourceIndex,
  prepareTransferProps,
  prepareExchangeProps,
} from "@services/transactions";
import {
  TransactionResponseDTO,
  TransactionStandardDTO,
  TransactionTransferDTO,
  TransactionExchangeDTO,
} from "@schemas/transaction";


export const createStandardTransaction = async (
  dto: TransactionStandardDTO,
  ownerId: string,
): Promise<TransactionResponseDTO> => {
  const sourceIndex = await getNextSourceIndex(ownerId);  
  return persistTransaction({ ...dto, ownerId, sourceIndex });
}

export const createTransferTransaction = async (
  dto: TransactionTransferDTO,
  ownerId: string,
): Promise<[TransactionResponseDTO, TransactionResponseDTO]> => {
  return createTransactionPair(ownerId, (context) => prepareTransferProps(dto, context));
}

export const createExchangeTransaction = async (
  dto: TransactionExchangeDTO,
  ownerId: string,
): Promise<[TransactionResponseDTO, TransactionResponseDTO]> => {
  return createTransactionPair(ownerId, (context) => prepareExchangeProps(dto, context));
}