import { LinkSpendingsToTransactionDTO, SpendingLinkResponseDTO } from '@vehicles/schema';
import { linkSpendingsToTransaction } from '@vehicles/services';
import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthenticatedRequest } from '@shared/http';

export const linkSpendingsHandler = async (
  req: FastifyRequest<{
    Body: LinkSpendingsToTransactionDTO;
  }>,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result: SpendingLinkResponseDTO = await linkSpendingsToTransaction(
    userId,
    req.body,
  );
  return res.code(200).send(result);
};
