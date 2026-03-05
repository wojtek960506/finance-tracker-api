import { TransactionStandardCreateProps } from "./types";
import { serializeTransaction } from "@schemas/serializers";
import { TransactionModel } from "@transaction/model";


export async function persistTransaction(props: TransactionStandardCreateProps) {
  const newTransaction = await TransactionModel.create(props);
  await newTransaction.populate([
    { path: 'categoryId', select: '_id type name' },
    { path: "paymentMethodId", select: "_id type name" },
  ]);
  return serializeTransaction(newTransaction);
}
