import { ICategory } from "@models/category-model";
import { ITransaction } from "@models/transaction-model";
import { TransactionResponseDTO } from "@schemas/transaction";


export type ITransactionEnhanced = Omit<ITransaction, "categoryId"> & {
  categoryId: Pick<ICategory, "_id" | "type" | "name">,
}

export const serializeTransaction = (
  transaction: ITransactionEnhanced,
): TransactionResponseDTO => {
  const { _id, __v, ownerId, refId, categoryId, ...rest } = transaction.toObject();
  return {
    ...rest,
    id: _id.toString(),
    ownerId: ownerId.toString(),
    refId: refId?.toString(),
    category: { id: categoryId._id.toString(), type: categoryId.type, name: categoryId.name },
  }
}
