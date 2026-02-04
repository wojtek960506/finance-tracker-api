import { TransactionStandardCreateProps } from "./types";
import { TransactionModel } from "@models/transaction-model";
import { ITransactionEnhanced, serializeTransaction } from "@schemas/serializers";


export async function persistTransaction(props: TransactionStandardCreateProps) {
  const newTransaction = await TransactionModel.create(props)
  await newTransaction.populate([
    { path: 'categoryId', select: '_id type name' }
  ]);
  return serializeTransaction(newTransaction as unknown as ITransactionEnhanced);
}
