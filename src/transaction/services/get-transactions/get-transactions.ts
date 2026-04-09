import { FilteredResponse } from '@shared/http';
import { TransactionQuery, TransactionsResponseDTO } from '@transaction/schema';
import { serializeTransaction } from '@transaction/serializers';
import { buildTransactionFilterQuery } from '@transaction/services';

import { listTransactions } from '../list-transactions';

export const getTransactions = async (
  query: TransactionQuery,
  userId: string,
): Promise<FilteredResponse<TransactionsResponseDTO>> => {
  const filter = buildTransactionFilterQuery(query, userId);

  return listTransactions({
    filter,
    query,
    userId,
    serialize: serializeTransaction,
  });
};
