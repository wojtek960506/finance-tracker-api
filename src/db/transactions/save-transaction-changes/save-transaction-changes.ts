import { ITransaction } from "@models/transaction-model";
import { TransactionStandardDTO } from "@schemas/transaction";
import { serializeTransaction } from "@schemas/serialize-transaction";


export const saveStandardTransactionChanges = async (
  transaction: ITransaction,
  newProps: TransactionStandardDTO,
) => {
  Object.assign(transaction, newProps);
  await transaction.save();

  return serializeTransaction(transaction);
}