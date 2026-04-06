import { FastifyInstance } from 'fastify';
import { DeleteResult } from 'mongoose';

import { authorizeAccessToken } from '@auth/services';
import {
  NamedResourceDTO,
  NamedResourceResponseDTO,
  NamedResourceResponseSchema,
  NamedResourceSchema,
  NamedResourcesResponseDTO,
  NamedResourcesResponseSchema,
} from '@named-resource';
import {
  createNamedResourceHandler,
  deleteNamedResourceHandler,
  favoriteNamedResourceHandler,
  getFavoriteNamedResourcesHandler,
  getNamedResourceHandler,
  getNamedResourcesHandler,
  unfavoriteNamedResourceHandler,
  updateNamedResourceHandler,
} from '@named-resource/routes/handlers';
import { DeleteResultSchema, ParamsJustId, ParamsJustIdSchema } from '@shared/http';
import { validateBody } from '@utils/validation';

export async function categoryRoutes(
  app: FastifyInstance & { withTypeProvider: <_T>() => any },
) {
  app.get<{ Reply: NamedResourcesResponseDTO }>(
    '/',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Categories'],
        summary: 'List categories',
        description: 'Return all categories for the authenticated user.',
        response: {
          200: NamedResourcesResponseSchema,
        },
      },
    },
    getNamedResourcesHandler('category'),
  );

  app.get<{ Reply: NamedResourcesResponseDTO }>(
    '/favorites',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Categories'],
        summary: 'List favorite categories',
        description: 'Return all favorite categories for the authenticated user.',
        response: {
          200: NamedResourcesResponseSchema,
        },
      },
    },
    getFavoriteNamedResourcesHandler('category'),
  );

  app.get<{ Params: ParamsJustId; Reply: NamedResourceResponseDTO }>(
    '/:id',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Categories'],
        summary: 'Get category by id',
        description: 'Return a single category by id.',
        params: ParamsJustIdSchema,
        response: {
          200: NamedResourceResponseSchema,
        },
      },
    },
    getNamedResourceHandler('category'),
  );

  app.post<{ Body: NamedResourceDTO; Reply: NamedResourceResponseDTO }>(
    '/',
    {
      preHandler: [validateBody(NamedResourceSchema), authorizeAccessToken()],
      schema: {
        tags: ['Categories'],
        summary: 'Create category',
        description: 'Create a new category for the authenticated user.',
        body: NamedResourceSchema,
        response: {
          201: NamedResourceResponseSchema,
        },
      },
    },
    createNamedResourceHandler('category'),
  );

  app.put<{
    Params: ParamsJustId;
    Body: NamedResourceDTO;
    Reply: NamedResourceResponseDTO;
  }>(
    '/:id',
    {
      preHandler: [validateBody(NamedResourceSchema), authorizeAccessToken()],
      schema: {
        tags: ['Categories'],
        summary: 'Update category',
        description: 'Update a category by id.',
        params: ParamsJustIdSchema,
        body: NamedResourceSchema,
        response: {
          200: NamedResourceResponseSchema,
        },
      },
    },
    updateNamedResourceHandler('category'),
  );

  app.post<{ Params: ParamsJustId; Reply: NamedResourceResponseDTO }>(
    '/:id/favorite',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Categories'],
        summary: 'Favorite category',
        description: 'Mark category as favorite for the authenticated user.',
        params: ParamsJustIdSchema,
        response: {
          200: NamedResourceResponseSchema,
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
