import { prepareNamedResourcesMap } from '@named-resource/services';
import { FilteredResponse } from '@shared/http';
import { findTransactions, findTransactionsCount } from '@transaction/db';
import { TransactionQuery, TransactionsResponseDTO } from '@transaction/schema';
import { serializeTransaction } from '@transaction/serializers';
import { buildTransactionFilterQuery } from '@transaction/services';

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

  const [accountsMap, categoriesMap, paymentMethodsMap] = await Promise.all([
    prepareNamedResourcesMap(
      'account',
      userId,
      transactions.map((t) => t.accountId.toString()),
    ),
    prepareNamedResourcesMap(
      'category',
      userId,
      transactions.map((t) => t.categoryId.toString()),
    ),
    prepareNamedResourcesMap(
      'paymentMethod',
      userId,
      transactions.map((t) => t.paymentMethodId.toString()),
    ),
  ]);

  return {
    page: query.page,
    limit: query.limit,
    total,
    totalPages,
    items: transactions.map((transaction) =>
      serializeTransaction(transaction, categoriesMap, paymentMethodsMap, accountsMap),
    ),
  };
};
