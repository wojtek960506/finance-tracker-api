import { FilterQuery } from "mongoose";
import { ITransaction, TransactionModel } from "@models/transaction-model";


export const findTransactionTotalsOverall = async (
  filter: FilterQuery<ITransaction>
) => {
  return TransactionModel.aggregate([
    { $match: filter },
    { $group: {
      _id: { transactionType: "$transactionType" },
      totalItems: { $sum: 1 },
    }},
    { $sort: {"_id.transactionType": 1 } },
  ])
}

export const findTransactionTotalsByCurrency = async (
  filter: FilterQuery<ITransaction>
) => {
  return TransactionModel.aggregate([
    { $match: filter },
    { $group: { 
      _id: { currency: "$currency", transactionType: "$transactionType" },
      totalAmount: { $sum: "$amount" },
      totalItems: { $sum: 1 },
      averageAmount: { $avg: "$amount" },
      maxAmount: { $max: "$amount" },
      minAmount: { $min: "$amount" },
    }},
    { $sort: { "_id.currency": 1, "_id.transactionType": 1 } },
  ]);
}
