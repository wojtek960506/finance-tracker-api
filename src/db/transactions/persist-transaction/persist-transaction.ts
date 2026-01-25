import { TransactionStandardCreateProps } from "./types";
import { TransactionModel } from "@models/transaction-model";
import { serializeTransaction } from "@schemas/serialize-transaction";


// TODO naming convention (service -> db operation)
// createStandardTransaction -> peresistStandardTransaction
// updateStandardTransaction -> saveStandardTransactionChanges
// deleteStandardTransaction -> removeStandardTransaction

// TODO
// * rename `persistStandardTransaction` to just `persistTransaction` in case of more kinds
//   of transactions then some union will be allowed as it is in `persistTransactionPair`
export async function persistStandardTransaction(props: TransactionStandardCreateProps) {
  const newTransaction = await TransactionModel.create(props);
  return serializeTransaction(newTransaction);
}
