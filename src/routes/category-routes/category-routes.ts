import { FastifyInstance } from "fastify";
import { findCategory } from "@db/categories";
import { checkOwner } from "@services/general";
import { authorizeAccessToken } from "@services/auth";
import { CategoryModel } from "@models/category-model";
import { serializeCategory } from "@schemas/serializers";
import { AuthenticatedRequest, ParamsJustId } from "@routes/routes-types";
import { CategoriesResponseDTO, CategoryResponseDTO } from "@schemas/category";


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

      const category = await findCategory(categoryId);
      if (category.type !== "system")
        checkOwner(userId, categoryId, category.ownerId.toString(), "category");
      return res.code(200).send(serializeCategory(category));
    }
  )
}
