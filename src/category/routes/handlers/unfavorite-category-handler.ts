import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthenticatedRequest, ParamsJustId } from '@shared/http';
import { unfavoriteNamedResource } from '@shared/named-resource/services';

export const unfavoriteCategoryHandler = async (
  req: FastifyRequest<{ Params: ParamsJustId }>,
  res: FastifyReply,
) => {
  const categoryId = req.params.id;
  const userId = (req as AuthenticatedRequest).userId;
  const result = await unfavoriteNamedResource('category', categoryId, userId);
  return res.code(200).send(result);
};
