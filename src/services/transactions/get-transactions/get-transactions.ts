import { FilteredResponse } from "@routes/routes-types";
import { prepareCategoriesMap } from "@category/services";
import { serializeTransaction } from "@schemas/serializers";
import { TransactionQuery } from "@schemas/transaction-query";
import { TransactionsResponseDTO } from "@schemas/transaction";
import { preparePaymentMethodsMap } from "@payment-method/services";
import { buildTransactionFilterQuery } from "@services/transactions";
import { findTransactions, findTransactionsCount } from "@db/transactions";


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
