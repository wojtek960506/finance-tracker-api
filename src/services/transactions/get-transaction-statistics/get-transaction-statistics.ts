import { TransactionModel } from "@models/transaction-model";
import { parseStatisticsResult } from "./parse-statistics-result";
import { getStatisticsGrouping } from "./get-statistics-grouping";
import { getStatisticsMatching } from "./get-statistics-matching";
import { TransactionStatisticsQuery } from "@schemas/transaction-query";


export const getTransactionStatistics = async (
  q: TransactionStatisticsQuery,
  userId: string,
) => {
  const result = await TransactionModel.aggregate([
    { $match: getStatisticsMatching(q, userId) },
    getStatisticsGrouping(q)
  ]);

  return parseStatisticsResult(result, q);
}