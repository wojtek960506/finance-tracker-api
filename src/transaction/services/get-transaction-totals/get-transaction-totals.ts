import {
  findTransactionTotalsByCurrency,
  findTransactionTotalsOverall,
} from '@transaction/db';
import { TransactionFiltersQuery } from '@transaction/schema';
import { buildTransactionFilterQuery } from '@transaction/services';

import {
  parseTotalsByCurrencyResult,
  parseTotalsOverallResult,
} from './parse-totals-result';

export async function getTransactionTotals(q: TransactionFiltersQuery, userId: string) {
  const filter = buildTransactionFilterQuery(q, userId);

  const totalsOverall = await findTransactionTotalsOverall(filter);
  const totalsByCurrency = await findTransactionTotalsByCurrency(filter);

  return {
    overall: parseTotalsOverallResult(totalsOverall),
    byCurrency: parseTotalsByCurrencyResult(totalsByCurrency),
  };
}
