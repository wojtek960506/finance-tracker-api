import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthenticatedRequest } from '@shared/http';
import { TransactionInvestmentDTO } from '@transaction/schema';
import { createInvestmentTransaction } from '@transaction/services';

export const createInvestmentTransactionHandler = async (
  req: FastifyRequest<{ Body: TransactionInvestmentDTO }>,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result = await createInvestmentTransaction(req.body, userId);
  return res.code(201).send(result);
};
