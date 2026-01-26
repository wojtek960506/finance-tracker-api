import { TransactionModel } from "@models/transaction-model";
import { parseStatisticsResult } from "./parse-statistics-result";
import { getStatisticsGrouping } from "./get-statistics-grouping";
import { getStatisticsMatching } from "./get-statistics-matching";
import { TransactionStatisticsQuery } from "@schemas/transaction-query";


export const getTransactionStatistics = async (
  q: TransactionStatisticsQuery,
  userId: string,
) => {
  const matching = getStatisticsMatching(q, userId);
  const grouping = getStatisticsGrouping(q);
  
  const result = await TransactionModel.aggregate([{ $match: matching }, grouping]);

  return parseStatisticsResult(result, q);
}