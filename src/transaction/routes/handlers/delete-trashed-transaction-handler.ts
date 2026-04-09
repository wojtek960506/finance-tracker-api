import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthenticatedRequest, ParamsJustId } from '@shared/http';
import { deleteTrashedTransaction } from '@transaction/services';

export const deleteTrashedTransactionHandler = async (
  req: FastifyRequest<{ Params: ParamsJustId }>,
  res: FastifyReply,
) => {
  const transactionId = req.params.id;
  const userId = (req as AuthenticatedRequest).userId;
  const result = await deleteTrashedTransaction(transactionId, userId);
  return res.code(200).send(result);
};
