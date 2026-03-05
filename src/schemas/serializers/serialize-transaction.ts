import { CategoriesMap } from "@category/services";
import { ITransaction } from "@transaction/model";
import { PaymentMethodsMap } from "@payment-method/services";
import { TransactionResponseDTO } from "@transaction/schema";


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
