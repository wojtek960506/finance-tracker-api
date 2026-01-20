import { ITransaction } from "@models/transaction-model";
import { TransactionUpdateStandardDTO } from "@schemas/transaction";
import { serializeTransaction } from "@schemas/serialize-transaction";


export const saveStandardTransactionChanges = async (
  transaction: ITransaction,
  newProps: TransactionUpdateStandardDTO,
) => {
  Object.assign(transaction, newProps);
  await transaction.save();

  return serializeTransaction(transaction);
}