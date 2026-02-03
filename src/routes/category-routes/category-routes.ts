import { FastifyInstance } from "fastify";
import { validateBody } from "@utils/validation";
import { ParamsJustId } from "@routes/routes-types";
import { authorizeAccessToken } from "@services/auth";
import {
  getCategoryHandler,
  getCategoriesHandler,
  createCategoryHandler,
} from "./handlers";
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
    getCategoriesHandler,
  );

  app.get<{ Params: ParamsJustId, Reply: CategoryResponseDTO }>(
    "/:id",
    { preHandler: authorizeAccessToken() },
    getCategoryHandler,
  );

  app.post<{ Body: CategoryDTO, Reply: CategoryResponseDTO }>(
    "/",
    { preHandler: [validateBody(CategorySchema), authorizeAccessToken()] },
    createCategoryHandler,
  );
}
