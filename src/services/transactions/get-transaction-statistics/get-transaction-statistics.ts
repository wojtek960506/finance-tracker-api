import { validateSchema } from "@utils/validation";
import { TransactionModel } from "@models/transaction-model";
import { parseStatisticsResult } from "./parse-statistics-result";
import { getStatisticsGrouping } from "./get-statistics-grouping";
import { getStatisticsMatching } from "./get-statistics-matching";
import {
  TransactionStatisticsQuery,
  transactionStatisticsQuerySchema,
} from "@schemas/transaction-query";


export const getTransactionStatistics = async (
  query: TransactionStatisticsQuery,
  userId: string,
) => {
  const q = validateSchema(transactionStatisticsQuerySchema, query);
  
  const result = await TransactionModel.aggregate([
    getStatisticsMatching(q, userId),
    getStatisticsGrouping(q)
  ]);

  return parseStatisticsResult(result, q);
}