import { CategoryDTO } from "@schemas/category";
import { updateCategory } from "@services/categories";
import { FastifyReply, FastifyRequest } from "fastify";
import { AuthenticatedRequest, ParamsJustId } from "@routes/routes-types";


export const updateCategoryHandler = async (
  req: FastifyRequest<{ Params: ParamsJustId, Body: CategoryDTO }>,
  res: FastifyReply,
) => {
  const categoryId = req.params.id;
  const userId = (req as AuthenticatedRequest).userId;
  const dto = req.body;

  const result = await updateCategory(categoryId, userId, dto);
  res.code(200).send(result);
}
