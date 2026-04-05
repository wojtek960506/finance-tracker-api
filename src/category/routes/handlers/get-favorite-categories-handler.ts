import { FastifyReply, FastifyRequest } from 'fastify';

import { getFavoriteCategories } from '@category/services';
import { AuthenticatedRequest } from '@shared/http';

export const getFavoriteCategoriesHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result = await getFavoriteCategories(userId);
  return res.code(200).send(result);
};
