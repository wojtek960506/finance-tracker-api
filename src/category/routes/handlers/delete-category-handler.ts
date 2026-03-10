import { FastifyReply, FastifyRequest } from 'fastify';

import { deleteCategory } from '@category/services';
import { AuthenticatedRequest, ParamsJustId } from '@shared/http';

export const deleteCategoryHandler = async (
  req: FastifyRequest<{ Params: ParamsJustId }>,
  res: FastifyReply,
) => {
  const categoryId = req.params.id;
  const userId = (req as AuthenticatedRequest).userId;

  const result = await deleteCategory(categoryId, userId);
  res.code(200).send(result);
};
