import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthenticatedRequest, ParamsJustId } from '@shared/http';
import { deleteNamedResource } from '@shared/named-resource/services';

export const deleteCategoryHandler = async (
  req: FastifyRequest<{ Params: ParamsJustId }>,
  res: FastifyReply,
) => {
  const categoryId = req.params.id;
  const userId = (req as AuthenticatedRequest).userId;

  const result = await deleteNamedResource('category', categoryId, userId);
  res.code(200).send(result);
};
