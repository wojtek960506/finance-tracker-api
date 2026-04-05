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
import {
  createNamedResourceHandler,
  deleteNamedResourceHandler,
  favoriteNamedResourceHandler,
  getFavoriteNamedResourcesHandler,
  getNamedResourceHandler,
  getNamedResourcesHandler,
  unfavoriteNamedResourceHandler,
  updateNamedResourceHandler,
} from '@shared/named-resource/routes/handlers';
import { validateBody } from '@utils/validation';

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
    getNamedResourcesHandler('category'),
  );

  app.get<{ Reply: CategoriesResponseDTO }>(
    '/favorites',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Categories'],
        summary: 'List favorite categories',
        description: 'Return all favorite categories for the authenticated user.',
        response: {
          200: CategoriesResponseSchema,
        },
      },
    },
    getFavoriteNamedResourcesHandler('category'),
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
    getNamedResourceHandler('category'),
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
    createNamedResourceHandler('category'),
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
    updateNamedResourceHandler('category'),
  );

  app.post<{ Params: ParamsJustId; Reply: CategoryResponseDTO }>(
    '/:id/favorite',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Categories'],
        summary: 'Favorite category',
        description: 'Mark category as favorite for the authenticated user.',
        params: ParamsJustIdSchema,
        response: {
          200: CategoryResponseSchema,
        },
      },
    },
    favoriteNamedResourceHandler('category'),
  );

  app.delete<{ Params: ParamsJustId; Reply: DeleteResult }>(
    '/:id/favorite',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Categories'],
        summary: 'Unfavorite category',
        description: 'Remove category from favorites for the authenticated user.',
        params: ParamsJustIdSchema,
        response: {
          200: DeleteResultSchema,
        },
      },
    },
    unfavoriteNamedResourceHandler('category'),
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
    deleteNamedResourceHandler('category'),
  );
}
