import { checkOwner } from "@services/general";
import { findCategoryById } from "@db/categories";
import { FastifyReply, FastifyRequest } from "fastify";
import { serializeCategory } from "@schemas/serializers";
import { AuthenticatedRequest, ParamsJustId } from "@routes/routes-types";


export const getCategoryHandler = async (
  req: FastifyRequest<{ Params: ParamsJustId }>,
  res: FastifyReply,
) => {
  const categoryId = req.params.id;
  const userId = (req as AuthenticatedRequest).userId;

  const category = await findCategoryById(categoryId);
  if (category.type !== "system")
    checkOwner(userId, categoryId, category.ownerId.toString(), "category");

  return res.code(200).send(serializeCategory(category));
}