import { TransactionTotalsQuery } from "@schemas/transaction-query";
import { buildTransactionFilterQuery } from "@/services/transactions";
import {
  findTransactionTotalsOverall,
  findTransactionTotalsByCurrency,
} from "@db/transactions";
import {
  parseTotalsOverallResult,
  parseTotalsByCurrencyResult,
} from "./parse-totals-result";


export async function getTransactionTotals(
  q: TransactionTotalsQuery,
  userId: string
) {
  const filter = buildTransactionFilterQuery(q, userId);
  if (q.excludeCategories && !q.category) filter.category = { $nin: q.excludeCategories }

  const totalsOverall = await findTransactionTotalsOverall(filter);
  const totalsByCurrency = await findTransactionTotalsByCurrency(filter);

  return {
    overall: parseTotalsOverallResult(totalsOverall),
    byCurrency: parseTotalsByCurrencyResult(totalsByCurrency),    
  }
}