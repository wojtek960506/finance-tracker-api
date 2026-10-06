import {
  SpendingLinkResponseDTO,
  UnlinkSpendingFromTransactionDTO,
} from '@vehicles/schema';
import { unlinkSpendingFromTransaction } from '@vehicles/services';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthenticatedRequest } from '@shared/http';

export const unlinkSpendingHandler = async (
  req: FastifyRequest<{
    Body: UnlinkSpendingFromTransactionDTO;
  }>,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result: SpendingLinkResponseDTO = await unlinkSpendingFromTransaction(
    userId,
    req.body.spendingType,
    req.body.spendingId,
  );
  return res.code(200).send(result);
};
