import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthenticatedRequest, ParamsJustId } from '@shared/http';
import { TransactionTransferDTO } from '@transaction/schema';
import { updateTransferTransaction } from '@transaction/services';

export const updateTransferTransactionHandler = async (
  req: FastifyRequest<{ Params: ParamsJustId; Body: TransactionTransferDTO }>,
  res: FastifyReply,
) => {
  const id = req.params.id;
  const userId = (req as AuthenticatedRequest).userId;
  const result = await updateTransferTransaction(id, userId, req.body);
  return res.code(200).send(result);
};
