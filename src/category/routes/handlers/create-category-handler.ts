import { FastifyReply, FastifyRequest } from 'fastify';

import { CategoryDTO } from '@category/schema';
import { AuthenticatedRequest } from '@shared/http';
import { createNamedResource } from '@shared/named-resource/services';

export const createCategoryHandler = async (
  req: FastifyRequest<{ Body: CategoryDTO }>,
  res: FastifyReply,
) => {
  const ownerId = (req as AuthenticatedRequest).userId;
  const result = await createNamedResource<CategoryDTO>('category', ownerId, req.body);
  return res.code(201).send(result);
};
