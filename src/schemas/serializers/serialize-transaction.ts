import { CategoriesMap } from "@services/categories";
import { ITransaction } from "@models/transaction-model";
import { TransactionResponseDTO } from "@schemas/transaction";
import { PaymentMethodsMap } from "@services/payment-methods";


export function serializeTransaction(transaction: ITransaction): TransactionResponseDTO;
export function serializeTransaction(
  transaction: ITransaction,
  categoriesMap: CategoriesMap,
  paymentMethodsMap: PaymentMethodsMap,
): TransactionResponseDTO;
export function serializeTransaction(
  transaction: ITransaction,
  categoriesMap?: CategoriesMap,
  paymentMethodsMap?: PaymentMethodsMap,
): TransactionResponseDTO {
  const { _id, __v, ownerId, refId, categoryId, paymentMethodId, ...rest } = transaction.toObject();

  const category = categoriesMap
    ? categoriesMap[categoryId.toString()]
    : { id: categoryId._id.toString(), type: categoryId.type, name: categoryId.name };
  const paymentMethod = paymentMethodsMap
    ? paymentMethodsMap[paymentMethodId.toString()]
    : {
        id: paymentMethodId._id.toString(),
        type: paymentMethodId.type,
        name: paymentMethodId.name,
      };

  return { 
    ...rest,
    id: _id.toString(),
    ownerId: ownerId.toString(),
    refId: refId?.toString(),
    category,
    paymentMethod,
  }
}
