import { FastifyReply, FastifyRequest } from 'fastify';

import { favoriteCategory } from '@category/services';
import { AuthenticatedRequest, ParamsJustId } from '@shared/http';

export const favoriteCategoryHandler = async (
  req: FastifyRequest<{ Params: ParamsJustId }>,
  res: FastifyReply,
) => {
  const categoryId = req.params.id;
  const userId = (req as AuthenticatedRequest).userId;
  const result = await favoriteCategory(categoryId, userId);
  return res.code(200).send(result);
};
