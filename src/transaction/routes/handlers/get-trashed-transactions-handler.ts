import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthenticatedRequest, FilteredResponse } from '@shared/http';
import {
  TrashedTransactionsResponseDTO,
  TrashTransactionQuery,
} from '@transaction/schema';
import { getTrashedTransactions } from '@transaction/services';

export const getTrashedTransactionsHandler = async (
  req: FastifyRequest<{ Querystring: TrashTransactionQuery }>,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result: FilteredResponse<TrashedTransactionsResponseDTO> =
    await getTrashedTransactions(req.query, userId);
  return res.code(200).send(result);
};
