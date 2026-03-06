import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthenticatedRequest } from '@shared/http';
import { deleteTransactions } from '@transaction/services';

export const deleteTransactionsHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  const ownerId = (req as AuthenticatedRequest).userId;
  const result = await deleteTransactions(ownerId);
  return res.code(200).send(result);
};
