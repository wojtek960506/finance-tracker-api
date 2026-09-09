import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthenticatedRequest } from '@shared/http';
import { TransactionExchangeDTO } from '@transaction/schema';
import { createExchangeTransaction } from '@transaction/services';

export const createExchangeTransactionHandler = async (
  req: FastifyRequest<{ Body: TransactionExchangeDTO }>,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result = await createExchangeTransaction(req.body, userId);
  return res.code(201).send(result);
};
