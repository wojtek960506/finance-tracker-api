import { FastifyReply, FastifyRequest } from 'fastify';

import { CategoriesResponseDTO } from '@category/schema';
import { AuthenticatedRequest } from '@shared/http';
import { listNamedResources } from '@shared/named-resource/services';

export const getCategoriesHandler = async (req: FastifyRequest, res: FastifyReply) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result = await listNamedResources<CategoriesResponseDTO[number]>(
    'category',
    userId,
  );
  return res.code(200).send(result);
};
