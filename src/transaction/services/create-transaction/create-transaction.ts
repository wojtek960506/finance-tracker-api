import { checkOwner } from "@shared/services"
import { findCategoryById } from "@category/db"
import { persistTransaction } from "@transaction/db"
import { SystemCategoryNotAllowed } from "@utils/errors"
import { findPaymentMethodById } from "@payment-method/db"
import { createTransactionPair } from "./create-transaction-pair"
import {
  TransactionExchangeDTO,
  TransactionResponseDTO,
  TransactionStandardDTO,
  TransactionTransferDTO,
} from "@transaction/schema"
import {
  getNextSourceIndex,
  prepareExchangeProps,
  prepareTransferProps,
} from "@transaction/services"


export const createStandardTransaction = async (
  dto: TransactionStandardDTO,
  ownerId: string,
): Promise<TransactionResponseDTO> => {
  // in case of wrong categoryId the error is thrown and creation is stopped
  const category = await findCategoryById(dto.categoryId);
  if (category.type === "system")
    throw new SystemCategoryNotAllowed(category.id);
  const paymentMethod = await findPaymentMethodById(dto.paymentMethodId);
  if (paymentMethod.type !== "system")
    checkOwner(ownerId, paymentMethod.id, paymentMethod.ownerId!, "paymentMethod");

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
