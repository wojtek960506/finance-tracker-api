import { CategoryDTO } from "@schemas/category";
import { normalizeWhitespace } from "@utils/strings";
import { CategoryType } from "@models/category-model";
import { FastifyReply, FastifyRequest } from "fastify";
import { CategoryAlreadyExistsError } from "@utils/errors";
import { AuthenticatedRequest } from "@routes/routes-types";
import { findCategoryByName, persistCategory } from "@db/categories";


export const createCategoryHandler = async (
  req: FastifyRequest<{ Body: CategoryDTO }>,
  res: FastifyReply,
) => {
  const ownerId = (req as AuthenticatedRequest).userId;
  const { name } = req.body;

  const category = await findCategoryByName(name); 
  if (category) throw new CategoryAlreadyExistsError(category.nameNormalized);

  const props = {
    ownerId,
    type: "user" as CategoryType,
    name: normalizeWhitespace(name),
    nameNormalized: normalizeWhitespace(name).toLowerCase(),
  }

  const result = await persistCategory(props);
  return res.code(201).send(result);
}
