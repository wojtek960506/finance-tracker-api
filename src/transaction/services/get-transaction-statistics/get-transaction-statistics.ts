import { TransactionModel } from '@transaction/model';
import { TransactionStatisticsQuery } from '@transaction/schema';

import { getStatisticsGrouping } from './get-statistics-grouping';
import { getStatisticsMatching } from './get-statistics-matching';
import { parseStatisticsResult } from './parse-statistics-result';

export const getTransactionStatistics = async (
  q: TransactionStatisticsQuery,
  userId: string,
) => {
  const matching = getStatisticsMatching(q, userId);
  const grouping = getStatisticsGrouping(q);

  const result = await TransactionModel.aggregate([{ $match: matching }, grouping]);

  return parseStatisticsResult(result, q);
};
