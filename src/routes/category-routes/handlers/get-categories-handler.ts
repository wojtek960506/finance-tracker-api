import { FastifyReply, FastifyRequest } from "fastify";
import { CategoryModel } from "@models/category-model";
import { serializeCategory } from "@schemas/serializers";
import { AuthenticatedRequest } from "@routes/routes-types";


export const getCategoriesHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result = await CategoryModel.find({
    $or: [{ ownerId: userId }, { type: "system" }]
  });
  return res.code(200).send(result.map(c => serializeCategory(c)));
}