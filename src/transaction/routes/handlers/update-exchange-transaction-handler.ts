import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthenticatedRequest, ParamsJustId } from '@shared/http';
import { TransactionExchangeDTO } from '@transaction/schema';
import { updateExchangeTransaction } from '@transaction/services';

export const updateExchangeTransactionHandler = async (
  req: FastifyRequest<{ Params: ParamsJustId; Body: TransactionExchangeDTO }>,
  res: FastifyReply,
) => {
  const id = req.params.id;
  const userId = (req as AuthenticatedRequest).userId;
  const result = await updateExchangeTransaction(id, userId, req.body);
  return res.code(200).send(result);
};
