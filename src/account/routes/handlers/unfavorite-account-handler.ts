import { FastifyReply, FastifyRequest } from 'fastify';

import { unfavoriteAccount } from '@account/services';
import { AuthenticatedRequest, ParamsJustId } from '@shared/http';

export const unfavoriteAccountHandler = async (
  req: FastifyRequest<{ Params: ParamsJustId }>,
  res: FastifyReply,
) => {
  const accountId = req.params.id;
  const userId = (req as AuthenticatedRequest).userId;
  const result = await unfavoriteAccount(accountId, userId);
  return res.code(200).send(result);
};
