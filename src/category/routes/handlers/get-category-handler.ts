import { FastifyReply, FastifyRequest } from 'fastify';

import { CategoryResponseDTO } from '@category/schema';
import { AuthenticatedRequest, ParamsJustId } from '@shared/http';
import { getNamedResource } from '@shared/named-resource/services';

export const getCategoryHandler = async (
  req: FastifyRequest<{ Params: ParamsJustId }>,
  res: FastifyReply,
) => {
  const categoryId = req.params.id;
  const userId = (req as AuthenticatedRequest).userId;
  const result = await getNamedResource<CategoryResponseDTO>('category', categoryId, userId);
  return res.code(200).send(result);
};
