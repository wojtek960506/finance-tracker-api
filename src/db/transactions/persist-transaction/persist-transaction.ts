import { TransactionStandardCreateProps } from "./types";
import { serializeTransaction } from "@schemas/serializers";
import { TransactionModel } from "@models/transaction-model";


export async function persistTransaction(props: TransactionStandardCreateProps) {
  const newTransaction = await TransactionModel.create(props);
  return serializeTransaction(newTransaction);
}
