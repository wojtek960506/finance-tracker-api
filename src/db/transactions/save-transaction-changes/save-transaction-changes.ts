import { ITransaction } from "@models/transaction-model";
import { TransactionCreateStandardDTO } from "@schemas/transaction";
import { serializeTransaction } from "@schemas/serialize-transaction";


export const saveStandardTransactionChanges = async (
  transaction: ITransaction,
  newProps: TransactionCreateStandardDTO,
) => {
  Object.assign(transaction, newProps);
  await transaction.save();

  return serializeTransaction(transaction);
}