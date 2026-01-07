import { FilterQuery, Types } from "mongoose";
import { ITransaction } from "@models/transaction-model";
import { TransactionFiltersQuery } from "@schemas/transaction-query";


export const buildTransactionFilterQuery = (
  q: TransactionFiltersQuery, ownerId: string
): FilterQuery<ITransaction> => {
  const query: FilterQuery<ITransaction> = {};

  if (q.transactionType) query.transactionType = q.transactionType;
  if (q.currency) query.currency = q.currency;
  if (q.category) query.category = q.category;
  if (q.paymentMethod) query.paymentMethod = q.paymentMethod;
  if (q.account) query.account = q.account;
  
  if (q.minAmount || q.maxAmount) {
    query.amount = {};
    if (q.minAmount) query.amount.$gte = q.minAmount;
    if (q.maxAmount) query.amount.$lte = q.maxAmount;
  }

  if (q.startDate || q.endDate) {
    query.date = {};
    if (q.startDate) query.date.$gte = q.startDate;
    if (q.endDate) query.date.$lte = q.endDate;
  }

  // always fitler transactions by query id
  query.ownerId = new Types.ObjectId(ownerId)

  return query;
}