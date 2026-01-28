import { FilterQuery } from "mongoose";
import { TransactionQuery } from "@schemas/transaction-query";
import { ITransaction, TransactionModel } from "@models/transaction-model";


export const findTransactions = async (
  filter: FilterQuery<ITransaction>,
  query: Pick<TransactionQuery, "page" | "limit" | "sortBy" | "sortOrder">,
) => {
  return TransactionModel
    .find(filter)
    .sort({
      [query.sortBy]: query.sortOrder === "asc" ? 1 : -1,
      sourceIndex: query.sortOrder === "asc" ? 1 : -1,
    })
    .skip((query.page - 1) * query.limit)
    .limit(query.limit);
}

export const findTransactionsCount = async (
  filter: FilterQuery<ITransaction>
) => TransactionModel.countDocuments(filter);
