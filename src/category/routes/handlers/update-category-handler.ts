import { CategoryDTO } from "@category/schema";
import { updateCategory } from "@category/services";
import { FastifyReply, FastifyRequest } from "fastify";
import { AuthenticatedRequest, ParamsJustId } from "@shared/http";


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
