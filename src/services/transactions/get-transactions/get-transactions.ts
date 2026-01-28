import { FilteredResponse } from "@routes/routes-types";
import { TransactionQuery } from "@schemas/transaction-query";
import { TransactionsResponseDTO } from "@schemas/transaction";
import { buildTransactionFilterQuery } from "@services/transactions";
import { serializeTransaction } from "@schemas/serialize-transaction";
import { findTransactions, findTransactionsCount } from "@db/transactions";


export const getTransactions = async (
  query: TransactionQuery,
  userId: string,
): Promise<FilteredResponse<TransactionsResponseDTO>> => {
  const filter = buildTransactionFilterQuery(query, userId);

  const [transactions, total] = await Promise.all([
    findTransactions(filter, query),
    findTransactionsCount(filter),
  ])

  const totalPages = Math.ceil(total / query.limit);

  return {
    page: query.page,
    limit: query.limit,
    total,
    totalPages,
    items: transactions.map(transaction => serializeTransaction(transaction))
  }
}