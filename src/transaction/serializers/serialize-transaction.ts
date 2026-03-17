import { AccountsMap } from '@account/services';
import { CategoriesMap } from '@category/services';
import { PaymentMethodsMap } from '@payment-method/services';
import { ITransaction } from '@transaction/model';
import { TransactionResponseDTO } from '@transaction/schema';

export function serializeTransaction(transaction: ITransaction): TransactionResponseDTO;
export function serializeTransaction(
  transaction: ITransaction,
  categoriesMap: CategoriesMap,
  paymentMethodsMap: PaymentMethodsMap,
  accountsMap: AccountsMap,
): TransactionResponseDTO;
export function serializeTransaction(
  transaction: ITransaction,
  categoriesMap?: CategoriesMap,
  paymentMethodsMap?: PaymentMethodsMap,
  accountsMap?: AccountsMap,
): TransactionResponseDTO {
  const { _id, __v, ownerId, refId, categoryId, paymentMethodId, accountId, ...rest } =
    transaction.toObject();

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
  const account = accountsMap
    ? accountsMap[accountId.toString()]
    : { id: accountId._id.toString(), type: accountId.type, name: accountId.name };

  return {
    ...rest,
    id: _id.toString(),
    ownerId: ownerId.toString(),
    refId: refId?.toString(),
    category,
    paymentMethod,
    account,
  };
}
