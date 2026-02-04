import { ITransaction } from "@models/transaction-model";
import { TransactionResponseDTO } from "@schemas/transaction";


export const serializeTransaction = (transaction: ITransaction): TransactionResponseDTO => {
  const { _id, __v, ownerId, refId, categoryId, ...rest } = transaction.toObject();
  return {
    ...rest,
    id: _id.toString(),
    ownerId: ownerId.toString(),
    refId: refId?.toString(),
    categoryId: categoryId.toString(),
  }
}
