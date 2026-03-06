import { FastifyInstance } from 'fastify';

import { authorizeAccessToken } from '@auth/services';
import {
  CategoriesResponseDTO,
  CategoryDTO,
  CategoryResponseDTO,
  CategorySchema,
} from '@category/schema';
import { ParamsJustId } from '@shared/http';
import { validateBody } from '@utils/validation';

import {
  createCategoryHandler,
  getCategoriesHandler,
  getCategoryHandler,
  updateCategoryHandler,
} from './handlers';

export async function categoryRoutes(
  app: FastifyInstance & { withTypeProvider: <_T>() => any },
) {
  app.get<{ Reply: CategoriesResponseDTO }>(
    '/',
    { preHandler: authorizeAccessToken() },
    getCategoriesHandler,
  );

  app.get<{ Params: ParamsJustId; Reply: CategoryResponseDTO }>(
    '/:id',
    { preHandler: authorizeAccessToken() },
    getCategoryHandler,
  );

  app.post<{ Body: CategoryDTO; Reply: CategoryResponseDTO }>(
    '/',
    { preHandler: [validateBody(CategorySchema), authorizeAccessToken()] },
    createCategoryHandler,
  );

  app.put<{ Params: ParamsJustId; Body: CategoryDTO; Reply: CategoryResponseDTO }>(
    '/:id',
    { preHandler: [validateBody(CategorySchema), authorizeAccessToken()] },
    updateCategoryHandler,
  );
}
