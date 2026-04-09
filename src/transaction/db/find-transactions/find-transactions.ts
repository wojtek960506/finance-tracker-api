import { FilterQuery } from 'mongoose';

import { ITransaction, TransactionModel } from '@transaction/model';

type FindTransactionsQuery = {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
};

export const findTransactions = async (
  filter: FilterQuery<ITransaction>,
  query: FindTransactionsQuery,
) => {
  const sortDirection = query.sortOrder === 'asc' ? 1 : -1;
  const primarySortField =
    query.sortBy === 'deletedAt'
      ? 'deletion.deletedAt'
      : query.sortBy === 'purgeAt'
        ? 'deletion.purgeAt'
        : query.sortBy;

  return TransactionModel.find(filter)
    .sort({
      [primarySortField]: sortDirection,
      ...(primarySortField.startsWith('deletion.') ? { date: sortDirection } : {}),
      sourceIndex: sortDirection,
    })
    .skip((query.page - 1) * query.limit)
    .limit(query.limit);
};

export const findTransactionsCount = async (filter: FilterQuery<ITransaction>) =>
  TransactionModel.countDocuments(filter);
