import { ITransaction } from "@models/transaction-model";
import { serializeTransaction } from "@schemas/serializers";
import { TransactionStandardDTO } from "@schemas/transaction";


export const saveTransactionChanges = async (
  transaction: ITransaction,
  newProps: TransactionStandardDTO,
) => {
  Object.assign(transaction, newProps);
  await transaction.save();
  await transaction.populate([
    { path: "categoryId", select: '_id type name' },
  ]);
  return serializeTransaction(transaction);
}
