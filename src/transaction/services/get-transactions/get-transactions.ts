import { FilteredResponse } from "@shared/http"
import { TransactionQuery } from "@transaction/schema"
import { prepareCategoriesMap } from "@category/services"
import { TransactionsResponseDTO } from "@transaction/schema"
import { serializeTransaction } from "@transaction/serializers"
import { buildTransactionFilterQuery } from "@transaction/services"
import { preparePaymentMethodsMap } from "@payment-method/services"
import { findTransactions, findTransactionsCount } from "@transaction/db"


export const getTransactions = async (
  query: TransactionQuery,
  userId: string,
): Promise<FilteredResponse<TransactionsResponseDTO>> => {
  const filter = buildTransactionFilterQuery(query, userId);

  const [transactions, total] = await Promise.all([
    findTransactions(filter, query),
    findTransactionsCount(filter),
  ]);

  const totalPages = Math.ceil(total / query.limit);

  const [categoriesMap, paymentMethodsMap] = await Promise.all([
    prepareCategoriesMap(userId, transactions),
    preparePaymentMethodsMap(userId, transactions),
  ]);

  return {
    page: query.page,
    limit: query.limit,
    total,
    totalPages,
    items: transactions.map(
      transaction => serializeTransaction(transaction, categoriesMap, paymentMethodsMap)
    )
  }
}
