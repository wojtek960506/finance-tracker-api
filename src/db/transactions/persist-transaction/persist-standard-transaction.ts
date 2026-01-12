import { StandardTransactionProps } from "./types";
import { TransactionModel } from "@models/transaction-model";
import { serializeTransaction } from "@schemas/serialize-transaction";


export async function persistStandardTransaction(props: StandardTransactionProps) {
  const newTransaction = await TransactionModel.create(props);
  return serializeTransaction(newTransaction);
}