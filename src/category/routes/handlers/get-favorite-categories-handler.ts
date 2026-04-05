import { FastifyReply, FastifyRequest } from 'fastify';

import { CategoryResponseDTO } from '@category/schema';
import { AuthenticatedRequest } from '@shared/http';
import { getFavoriteNamedResources } from '@shared/named-resource/services';

export const getFavoriteCategoriesHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result = await getFavoriteNamedResources<CategoryResponseDTO>('category', userId);
  return res.code(200).send(result);
};
