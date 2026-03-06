import { CategoryDTO } from "@category/schema"
import { AuthenticatedRequest } from "@shared/http"
import { createCategory } from "@category/services"
import { FastifyReply, FastifyRequest } from "fastify"


export const createCategoryHandler = async (
  req: FastifyRequest<{ Body: CategoryDTO }>,
  res: FastifyReply,
) => {
  const ownerId = (req as AuthenticatedRequest).userId;
  const result = await createCategory(ownerId, req.body);
  return res.code(201).send(result);
}
