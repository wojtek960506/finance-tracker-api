import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthenticatedRequest, ParamsJustId } from '@shared/http';
import { TransactionInvestmentDTO } from '@transaction/schema';
import { updateInvestmentTransaction } from '@transaction/services';

export const updateInvestmentTransactionHandler = async (
  req: FastifyRequest<{ Params: ParamsJustId; Body: TransactionInvestmentDTO }>,
  res: FastifyReply,
) => {
  const id = req.params.id;
  const userId = (req as AuthenticatedRequest).userId;
  const result = await updateInvestmentTransaction(id, userId, req.body);
  return res.code(200).send(result);
};
