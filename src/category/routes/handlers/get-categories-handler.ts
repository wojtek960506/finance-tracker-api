import { findCategories } from "@category/db";
import { serializeCategory } from "@category/serializers";
import { FastifyReply, FastifyRequest } from "fastify";
import { AuthenticatedRequest } from "@shared/http";


export const getCategoriesHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result = await findCategories(userId);
  return res.code(200).send(result.map(c => serializeCategory(c)));
}
