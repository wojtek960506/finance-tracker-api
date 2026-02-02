import { FastifyInstance } from "fastify";
import { checkOwner } from "@services/general";
import { persistCategory } from "@db/categories";
import { validateBody } from "@utils/validation";
import { normalizeWhitespace } from "@utils/strings";
import { authorizeAccessToken } from "@services/auth";
import { serializeCategory } from "@schemas/serializers";
import { CategoryAlreadyExistsError } from "@utils/errors";
import { CategoryModel, CategoryType } from "@models/category-model";
import { findCategoryById, findCategoryByName } from "@db/categories";
import { AuthenticatedRequest, ParamsJustId } from "@routes/routes-types";
import {
  CategoryDTO,
  CategorySchema,
  CategoryResponseDTO,
  CategoriesResponseDTO,
} from "@schemas/category";


export async function categoryRoutes(
  app: FastifyInstance & { withTypeProvider: <T>() => any }
) {

  app.get<{ Reply: CategoriesResponseDTO }>(
    "/",
    { preHandler: authorizeAccessToken() },
    async (req, res) => {
      const userId = (req as AuthenticatedRequest).userId;
      const result = await CategoryModel.find({
        $or: [{ ownerId: userId }, { type: "system" }]
      });
      return res.code(200).send(result.map(c => serializeCategory(c)));
    }
  )

  app.get<{ Params: ParamsJustId, Reply: CategoryResponseDTO }>(
    "/:id",
    { preHandler: authorizeAccessToken() },
    async (req, res) => {
      const categoryId = req.params.id;
      const userId = (req as AuthenticatedRequest).userId;

      const category = await findCategoryById(categoryId);
      if (category.type !== "system")
        checkOwner(userId, categoryId, category.ownerId.toString(), "category");
      return res.code(200).send(serializeCategory(category));
    }
  )

  app.post<{ Body: CategoryDTO, Reply: CategoryResponseDTO }>(
    "/",
    { preHandler: [validateBody(CategorySchema), authorizeAccessToken()] },
    async (req, res) => {
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
  )
}
