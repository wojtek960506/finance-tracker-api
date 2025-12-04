import { ITransaction } from "@models/transaction-model";
import { TransactionAnalysisQuery } from "@schemas/transaction-query";
import mongoose, { FilterQuery } from "mongoose";

type TransactionWithoutAmount = Omit<ITransaction, "amount">

export const buildTransactionAnalysisQuery = (
  q: TransactionAnalysisQuery,
  ownerId: string
): FilterQuery<TransactionWithoutAmount> => {
  const query: FilterQuery<TransactionWithoutAmount> = {};

  query.transactionType = q.transactionType;
  query.currency = q.currency;
  // end date is less than because it will be easier to filter by whole month or year
  query.date = { $gte: q.startDate, $lt: q.endDate };
  
  if (q.category) query.category = q.category;
  if (q.paymentMethod) query.paymentMethod = q.paymentMethod;
  if (q.account) query.account = q.account;

  // always fitler transactions by query id
  query.ownerId = new mongoose.Types.ObjectId(ownerId);

  return query;
}
