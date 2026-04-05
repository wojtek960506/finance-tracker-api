import { FastifyReply, FastifyRequest } from 'fastify';

import { CategoryDTO } from '@category/schema';
import { AuthenticatedRequest, ParamsJustId } from '@shared/http';
import { updateNamedResource } from '@shared/named-resource/services';

export const updateCategoryHandler = async (
  req: FastifyRequest<{ Params: ParamsJustId; Body: CategoryDTO }>,
  res: FastifyReply,
) => {
  const categoryId = req.params.id;
  const userId = (req as AuthenticatedRequest).userId;
  const dto = req.body;

  const result = await updateNamedResource<CategoryDTO>(
    'category',
    categoryId,
    userId,
    dto,
  );
  res.code(200).send(result);
};
