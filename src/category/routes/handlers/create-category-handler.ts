import { CategoryDTO } from "@category/schema";
import { createCategory } from "@category/services";
import { FastifyReply, FastifyRequest } from "fastify";
import { AuthenticatedRequest } from "@routes/routes-types";


export const createCategoryHandler = async (
  req: FastifyRequest<{ Body: CategoryDTO }>,
  res: FastifyReply,
) => {
  const ownerId = (req as AuthenticatedRequest).userId;
  const result = await createCategory(ownerId, req.body);
  return res.code(201).send(result);
}
