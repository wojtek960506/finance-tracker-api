import { FilterQuery } from 'mongoose';

import { NamedResourcesMap } from '@named-resource/kind-config';
import { prepareNamedResourcesMap } from '@named-resource/services';
import { FilteredResponse } from '@shared/http';
import { findTransactions, findTransactionsCount } from '@transaction/db';
import { ITransaction } from '@transaction/model';
import { TransactionFiltersQuery } from '@transaction/schema';

type TransactionsListQuery = TransactionFiltersQuery & {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
};

type SerializeTransactionListItem<T> = (
  transaction: ITransaction,
  categoriesMap: NamedResourcesMap,
  paymentMethodsMap: NamedResourcesMap,
  accountsMap: NamedResourcesMap,
) => T;

type ListTransactionsOptions<T> = {
  filter: FilterQuery<ITransaction>;
  query: TransactionsListQuery;
  userId: string;
  serialize: SerializeTransactionListItem<T>;
};

export const listTransactions = async <T>({
  filter,
  query,
  userId,
  serialize,
}: ListTransactionsOptions<T>): Promise<FilteredResponse<T[]>> => {
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
      serialize(transaction, categoriesMap, paymentMethodsMap, accountsMap),
    ),
  };
};
