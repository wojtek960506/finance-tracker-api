import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthenticatedRequest } from '@shared/http';
import { TransactionBulkCreateDTO, TransactionsResponseDTO } from '@transaction/schema';
import { createTransactions } from '@transaction/services';

export const createTransactionsHandler = async (
  req: FastifyRequest<{
    Body: TransactionBulkCreateDTO;
    Reply: TransactionsResponseDTO;
  }>,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;

  return res.code(201).send(await createTransactions(req.body, userId));
};
