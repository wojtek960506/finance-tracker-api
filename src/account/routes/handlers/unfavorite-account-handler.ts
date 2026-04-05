import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthenticatedRequest, ParamsJustId } from '@shared/http';
import { unfavoriteNamedResource } from '@shared/named-resource/services';

export const unfavoriteAccountHandler = async (
  req: FastifyRequest<{ Params: ParamsJustId }>,
  res: FastifyReply,
) => {
  const accountId = req.params.id;
  const userId = (req as AuthenticatedRequest).userId;
  const result = await unfavoriteNamedResource('account', accountId, userId);
  return res.code(200).send(result);
};
