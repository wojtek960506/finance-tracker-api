import { FastifyReply, FastifyRequest } from 'fastify';

import { CategoryResponseDTO } from '@category/schema';
import { AuthenticatedRequest, ParamsJustId } from '@shared/http';
import { favoriteNamedResource } from '@shared/named-resource/services';

export const favoriteCategoryHandler = async (
  req: FastifyRequest<{ Params: ParamsJustId }>,
  res: FastifyReply,
) => {
  const categoryId = req.params.id;
  const userId = (req as AuthenticatedRequest).userId;
  const result = await favoriteNamedResource<CategoryResponseDTO>(
    'category',
    categoryId,
    userId,
  );
  return res.code(200).send(result);
};
