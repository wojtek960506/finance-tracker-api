import { ITransaction } from "@models/transaction-model";
import { TransactionResponseDTO } from "./transaction";


export const serializeTransaction = (transaction: ITransaction): TransactionResponseDTO => {
  const { _id, __v, ownerId, ...rest } = transaction.toObject();
  return {
    ...rest,
    id: _id.toString(),
    ownerId: ownerId.toString(),
  }
}