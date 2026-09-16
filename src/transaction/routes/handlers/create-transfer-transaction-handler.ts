import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthenticatedRequest } from '@shared/http';
import { TransactionTransferDTO } from '@transaction/schema';
import { createTransferTransaction } from '@transaction/services';

export const createTransferTransactionHandler = async (
  req: FastifyRequest<{ Body: TransactionTransferDTO }>,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result = await createTransferTransaction(req.body, userId);
  return res.code(201).send(result);
};
