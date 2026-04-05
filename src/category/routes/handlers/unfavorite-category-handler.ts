import { FastifyReply, FastifyRequest } from 'fastify';

import { unfavoriteCategory } from '@category/services';
import { AuthenticatedRequest, ParamsJustId } from '@shared/http';

export const unfavoriteCategoryHandler = async (
  req: FastifyRequest<{ Params: ParamsJustId }>,
  res: FastifyReply,
) => {
  const categoryId = req.params.id;
  const userId = (req as AuthenticatedRequest).userId;
  const result = await unfavoriteCategory(categoryId, userId);
  return res.code(200).send(result);
};
