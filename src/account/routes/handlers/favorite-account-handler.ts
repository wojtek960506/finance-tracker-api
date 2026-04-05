import { FastifyReply, FastifyRequest } from 'fastify';

import { favoriteAccount } from '@account/services';
import { AuthenticatedRequest, ParamsJustId } from '@shared/http';

export const favoriteAccountHandler = async (
  req: FastifyRequest<{ Params: ParamsJustId }>,
  res: FastifyReply,
) => {
  const accountId = req.params.id;
  const userId = (req as AuthenticatedRequest).userId;
  const result = await favoriteAccount(accountId, userId);
  return res.code(200).send(result);
};
