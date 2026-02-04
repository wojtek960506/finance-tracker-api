import { ITransaction } from "@models/transaction-model";
import { TransactionStandardDTO } from "@schemas/transaction";
import { ITransactionEnhanced, serializeTransaction } from "@schemas/serializers";


export const saveTransactionChanges = async (
  transaction: ITransaction,
  newProps: TransactionStandardDTO,
) => {
  Object.assign(transaction, newProps);
  await transaction.save();
  await transaction.populate([
    { path: "categoryId", select: '_id type name' },
  ]);
  return serializeTransaction(transaction as unknown as ITransactionEnhanced);
}
