import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthenticatedRequest, ParamsJustId } from '@shared/http';
import { deleteTransaction } from '@transaction/services';

export async function deleteTransactionHandler(
  req: FastifyRequest<{ Params: ParamsJustId }>,
  res: FastifyReply,
) {
  const transactionId = req.params.id;
  const userId = (req as AuthenticatedRequest).userId;
  const result = await deleteTransaction(transactionId, userId);
  return res.code(200).send(result);
}
