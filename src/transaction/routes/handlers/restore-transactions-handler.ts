import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthenticatedRequest } from '@shared/http';
import { restoreTransactions } from '@transaction/services';

export const restoreTransactionsHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  const ownerId = (req as AuthenticatedRequest).userId;
  const result = await restoreTransactions(ownerId);
  return res.code(200).send(result);
};
