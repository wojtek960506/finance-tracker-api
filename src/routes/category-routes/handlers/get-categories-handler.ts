import { findCategories } from "@db/categories";
import { serializeCategory } from "@schemas/serializers";
import { FastifyReply, FastifyRequest } from "fastify";
import { AuthenticatedRequest } from "@routes/routes-types";


export const getCategoriesHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result = await findCategories(userId);
  return res.code(200).send(result.map(c => serializeCategory(c)));
}
