import { ITransaction } from "@transaction/model";
import { serializeTransaction } from "@transaction/serializers";
import { TransactionStandardDTO } from "@transaction/schema";


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
