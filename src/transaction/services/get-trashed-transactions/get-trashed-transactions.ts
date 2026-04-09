import { FilteredResponse } from '@shared/http';
import {
  TrashedTransactionsResponseDTO,
  TrashTransactionQuery,
} from '@transaction/schema';
import { serializeTrashedTransaction } from '@transaction/serializers';
import { buildTransactionFilterQuery } from '@transaction/services';

import { listTransactions } from '../list-transactions';

export const getTrashedTransactions = async (
  query: TrashTransactionQuery,
  userId: string,
): Promise<FilteredResponse<TrashedTransactionsResponseDTO>> => {
  const filter = buildTransactionFilterQuery(query, userId, 'trash');

  return listTransactions({
    filter,
    query,
    userId,
    serialize: serializeTrashedTransaction,
  });
};
