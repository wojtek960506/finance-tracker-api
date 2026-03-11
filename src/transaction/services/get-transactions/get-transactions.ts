import { prepareAccountsMap } from '@account/services';
import { prepareCategoriesMap } from '@category/services';
import { preparePaymentMethodsMap } from '@payment-method/services';
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
    prepareAccountsMap(userId, transactions),
    prepareCategoriesMap(userId, transactions),
    preparePaymentMethodsMap(userId, transactions),
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
