import { TransactionStandardCreateProps } from "./types";
import { TransactionModel } from "@models/transaction-model";
import { serializeTransaction } from "@schemas/serialize-transaction";


// TODO naming convention (service -> db operation)
// createStandardTransaction -> peresistStandardTransaction
// updateStandardTransaction -> saveStandardTransactionChanges
// deleteStandardTransaction -> removeStandardTransaction

export async function persistTransaction(props: TransactionStandardCreateProps) {
  const newTransaction = await TransactionModel.create(props);
  return serializeTransaction(newTransaction);
}
