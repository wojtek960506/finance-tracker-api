import { FastifyInstance } from "fastify"
import { ParamsJustId } from "@shared/http"
import { validateBody } from "@utils/validation"
import { authorizeAccessToken } from "@auth/services"
import {
  getCategoryHandler,
  getCategoriesHandler,
  createCategoryHandler,
  updateCategoryHandler,
} from "./handlers"
import {
  CategoryDTO,
  CategorySchema,
  CategoryResponseDTO,
  CategoriesResponseDTO,
} from "@category/schema"


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

  app.put<{ Params: ParamsJustId, Body: CategoryDTO, Reply: CategoryResponseDTO }>(
    "/:id",
    { preHandler: [validateBody(CategorySchema), authorizeAccessToken()] },
    updateCategoryHandler,
  )
}
