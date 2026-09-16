import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthenticatedRequest, ParamsJustId } from '@shared/http';
import { TransactionStandardDTO } from '@transaction/schema';
import { updateStandardTransaction } from '@transaction/services';

export const updateStandardTransactionHandler = async (
  req: FastifyRequest<{ Params: ParamsJustId; Body: TransactionStandardDTO }>,
  res: FastifyReply,
) => {
  const id = req.params.id;
  const userId = (req as AuthenticatedRequest).userId;
  const result = await updateStandardTransaction(id, userId, req.body);
  return res.code(200).send(result);
};
