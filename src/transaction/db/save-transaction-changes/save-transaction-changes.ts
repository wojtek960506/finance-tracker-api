import { ITransaction } from "@transaction/model"
import { TransactionStandardDTO } from "@transaction/schema"
import { serializeTransaction } from "@transaction/serializers"


export const saveTransactionChanges = async (
  transaction: ITransaction,
  newProps: TransactionStandardDTO,
) => {
  Object.assign(transaction, newProps);
  await transaction.save();
  await transaction.populate([
    { path: "categoryId", select: '_id type name' },
    { path: "paymentMethodId", select: "_id type name" },
  ]);
  return serializeTransaction(transaction);
}
