import { findCategoryById } from "@db/categories";
import { SystemCategoryNotAllowed } from "@utils/errors";
import { createTransactionPair } from "./create-transaction-pair";
import { persistTransaction } from "@db/transactions/persist-transaction";
import {
  TransactionResponseDTO,
  TransactionStandardDTO,
  TransactionTransferDTO,
  TransactionExchangeDTO,
} from "@schemas/transaction";
import {
  getNextSourceIndex,
  prepareTransferProps,
  prepareExchangeProps,
} from "@services/transactions";


// TODO (create transaction endpoints work after quick manual testing)
// - test manually update transcation endpoints
// - correct all unit tests which are broken by the changes for create and update of transactions
// - update retriving transaction to have full information about category
// - think about updating transaction factory functions (currently named mocks) to have similar
//   structure as for categories

export const createStandardTransaction = async (
  dto: TransactionStandardDTO,
  ownerId: string,
): Promise<TransactionResponseDTO> => {
  // in case of wrong categoryId the error is thrown and creation is stopped
  const category = await findCategoryById(dto.categoryId);
  if (category.type === "system")
    throw new SystemCategoryNotAllowed(category.id);

  const sourceIndex = await getNextSourceIndex(ownerId);  
  return persistTransaction({ ...dto, ownerId, sourceIndex });
}

export const createTransferTransaction = async (
  dto: TransactionTransferDTO,
  ownerId: string,
): Promise<[TransactionResponseDTO, TransactionResponseDTO]> => {
  return createTransactionPair(
    ownerId,
    "myAccount",
    (objectIds, context) => prepareTransferProps(dto, objectIds, context)
  );
}

export const createExchangeTransaction = async (
  dto: TransactionExchangeDTO,
  ownerId: string,
): Promise<[TransactionResponseDTO, TransactionResponseDTO]> => {
  return createTransactionPair(
    ownerId,
    "exchange",
    (objectIds, context) => prepareExchangeProps(dto, objectIds, context)
  );
}