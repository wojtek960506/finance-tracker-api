import { getCategory } from "@category/services"
import { FastifyReply, FastifyRequest } from "fastify"
import { ParamsJustId, AuthenticatedRequest } from "@shared/http"


export const getCategoryHandler = async (
  req: FastifyRequest<{ Params: ParamsJustId }>,
  res: FastifyReply,
) => {
  const categoryId = req.params.id;
  const userId = (req as AuthenticatedRequest).userId;
  const result = await getCategory(categoryId, userId);
  return res.code(200).send(result);
}
