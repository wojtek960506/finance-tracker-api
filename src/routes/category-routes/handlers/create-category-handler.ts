import { CategoryDTO } from "@schemas/category";
import { createCategory } from "@services/categories";
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
