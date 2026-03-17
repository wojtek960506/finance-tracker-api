import { FastifyInstance } from 'fastify';
import { DeleteResult } from 'mongoose';

import { authorizeAccessToken } from '@auth/services';
import {
  CategoriesResponseDTO,
  CategoriesResponseSchema,
  CategoryDTO,
  CategoryResponseDTO,
  CategoryResponseSchema,
  CategorySchema,
} from '@category/schema';
import { DeleteResultSchema, ParamsJustId, ParamsJustIdSchema } from '@shared/http';
import { validateBody } from '@utils/validation';

import {
  createCategoryHandler,
  deleteCategoryHandler,
  getCategoriesHandler,
  getCategoryHandler,
  updateCategoryHandler,
} from './handlers';

export async function categoryRoutes(
  app: FastifyInstance & { withTypeProvider: <_T>() => any },
) {
  app.get<{ Reply: CategoriesResponseDTO }>(
    '/',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Categories'],
        summary: 'List categories',
        description: 'Return all categories for the authenticated user.',
        response: {
          200: CategoriesResponseSchema,
        },
      },
    },
    getCategoriesHandler,
  );

  app.get<{ Params: ParamsJustId; Reply: CategoryResponseDTO }>(
    '/:id',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Categories'],
        summary: 'Get category by id',
        description: 'Return a single category by id.',
        params: ParamsJustIdSchema,
        response: {
          200: CategoryResponseSchema,
        },
      },
    },
    getCategoryHandler,
  );

  app.post<{ Body: CategoryDTO; Reply: CategoryResponseDTO }>(
    '/',
    {
      preHandler: [validateBody(CategorySchema), authorizeAccessToken()],
      schema: {
        tags: ['Categories'],
        summary: 'Create category',
        description: 'Create a new category for the authenticated user.',
        body: CategorySchema,
        response: {
          201: CategoryResponseSchema,
        },
      },
    },
    createCategoryHandler,
  );

  app.put<{ Params: ParamsJustId; Body: CategoryDTO; Reply: CategoryResponseDTO }>(
    '/:id',
    {
      preHandler: [validateBody(CategorySchema), authorizeAccessToken()],
      schema: {
        tags: ['Categories'],
        summary: 'Update category',
        description: 'Update a category by id.',
        params: ParamsJustIdSchema,
        body: CategorySchema,
        response: {
          200: CategoryResponseSchema,
        },
      },
    },
    updateCategoryHandler,
  );

  app.delete<{ Params: ParamsJustId; Reply: DeleteResult }>(
    '/:id',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Categories'],
        summary: 'Delete category',
        description: 'Delete a category by id.',
        params: ParamsJustIdSchema,
        response: {
          200: DeleteResultSchema,
        },
      },
    },
    deleteCategoryHandler,
  );
}
