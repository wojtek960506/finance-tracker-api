import { CategoriesMap } from "@services/categories";
import { ITransaction } from "@models/transaction-model";
import { TransactionResponseDTO } from "@schemas/transaction";


export function serializeTransaction(transaction: ITransaction): TransactionResponseDTO;
export function serializeTransaction(
  transaction: ITransaction,
  categoriesMap: CategoriesMap,
): TransactionResponseDTO;
export function serializeTransaction(
  transaction: ITransaction,
  categoriesMap?: CategoriesMap,
): TransactionResponseDTO {
  const { _id, __v, ownerId, refId, categoryId, ...rest } = transaction.toObject();

  const category = categoriesMap
    ? categoriesMap[categoryId.toString()]
    : { id: categoryId._id.toString(), type: categoryId.type, name: categoryId.name };

  return { 
    ...rest,
    id: _id.toString(),
    ownerId: ownerId.toString(),
    refId: refId?.toString(),
    category,
  }
}
