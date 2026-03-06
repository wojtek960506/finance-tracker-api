import { findCategories } from "@category/db"
import { AuthenticatedRequest } from "@shared/http"
import { FastifyReply, FastifyRequest } from "fastify"
import { serializeCategory } from "@category/serializers"


export const getCategoriesHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result = await findCategories(userId);
  return res.code(200).send(result.map(c => serializeCategory(c)));
}
