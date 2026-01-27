import { TransactionFiltersQuery } from "@schemas/transaction-query";
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
  q: TransactionFiltersQuery,
  userId: string
) {
  const filter = buildTransactionFilterQuery(q, userId);
  
  const totalsOverall = await findTransactionTotalsOverall(filter);
  const totalsByCurrency = await findTransactionTotalsByCurrency(filter);

  return {
    overall: parseTotalsOverallResult(totalsOverall),
    byCurrency: parseTotalsByCurrencyResult(totalsByCurrency),    
  }
}