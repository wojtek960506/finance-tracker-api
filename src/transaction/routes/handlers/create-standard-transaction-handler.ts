import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthenticatedRequest } from '@shared/http';
import { TransactionStandardDTO } from '@transaction/schema';
import { createStandardTransaction } from '@transaction/services';

export const createStandardTransactionHandler = async (
  req: FastifyRequest<{ Body: TransactionStandardDTO }>,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result = await createStandardTransaction(req.body, userId);
  return res.code(201).send(result);
};
