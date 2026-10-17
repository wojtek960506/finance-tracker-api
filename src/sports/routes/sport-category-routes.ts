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

export async function sportCategoryRoutes(
  app: FastifyInstance & { withTypeProvider: <_T>() => any },
) {
  app.get<{ Reply: NamedResourcesResponseDTO }>(
    '/',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Sport Categories'],
        summary: 'List sport categories',
        description:
          'Return all sport categories for the authenticated user, including system categories.',
        response: {
          200: NamedResourcesResponseSchema,
        },
      },
    },
    getNamedResourcesHandler('sportCategory'),
  );

  app.get<{ Reply: NamedResourcesResponseDTO }>(
    '/favorites',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Sport Categories'],
        summary: 'List favorite sport categories',
        description: 'Return all favorite sport categories for the authenticated user.',
        response: {
          200: NamedResourcesResponseSchema,
        },
      },
    },
    getFavoriteNamedResourcesHandler('sportCategory'),
  );

  app.get<{ Params: ParamsJustId; Reply: NamedResourceResponseDTO }>(
    '/:id',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Sport Categories'],
        summary: 'Get sport category by id',
        description: 'Return a single sport category by id.',
        params: ParamsJustIdSchema,
        response: {
          200: NamedResourceResponseSchema,
        },
      },
    },
    getNamedResourceHandler('sportCategory'),
  );

  app.post<{ Body: NamedResourceDTO; Reply: NamedResourceResponseDTO }>(
    '/',
    {
      preHandler: [validateBody(NamedResourceSchema), authorizeAccessToken()],
      schema: {
        tags: ['Sport Categories'],
        summary: 'Create sport category',
        description: 'Create a new custom sport category for the authenticated user.',
        body: NamedResourceSchema,
        response: {
          201: NamedResourceResponseSchema,
        },
      },
    },
    createNamedResourceHandler('sportCategory'),
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
        tags: ['Sport Categories'],
        summary: 'Update sport category (PUT)',
        description: 'Update a custom sport category by id.',
        params: ParamsJustIdSchema,
        body: NamedResourceSchema,
        response: {
          200: NamedResourceResponseSchema,
        },
      },
    },
    updateNamedResourceHandler('sportCategory'),
  );

  app.patch<{
    Params: ParamsJustId;
    Body: NamedResourceDTO;
    Reply: NamedResourceResponseDTO;
  }>(
    '/:id',
    {
      preHandler: [validateBody(NamedResourceSchema), authorizeAccessToken()],
      schema: {
        tags: ['Sport Categories'],
        summary: 'Update sport category (PATCH)',
        description: 'Update a custom sport category by id.',
        params: ParamsJustIdSchema,
        body: NamedResourceSchema,
        response: {
          200: NamedResourceResponseSchema,
        },
      },
    },
    updateNamedResourceHandler('sportCategory'),
  );

  app.post<{ Params: ParamsJustId; Reply: NamedResourceResponseDTO }>(
    '/:id/favorite',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Sport Categories'],
        summary: 'Favorite sport category',
        description: 'Mark sport category as favorite for the authenticated user.',
        params: ParamsJustIdSchema,
        response: {
          200: NamedResourceResponseSchema,
        },
      },
    },
    favoriteNamedResourceHandler('sportCategory'),
  );

  app.delete<{ Params: ParamsJustId; Reply: DeleteResult }>(
    '/:id/favorite',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Sport Categories'],
        summary: 'Unfavorite sport category',
        description: 'Remove sport category from favorites for the authenticated user.',
        params: ParamsJustIdSchema,
        response: {
          200: DeleteResultSchema,
        },
      },
    },
    unfavoriteNamedResourceHandler('sportCategory'),
  );

  app.delete<{ Params: ParamsJustId; Reply: DeleteResult }>(
    '/:id',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Sport Categories'],
        summary: 'Delete sport category',
        description: 'Delete a custom sport category by id.',
        params: ParamsJustIdSchema,
        response: {
          200: DeleteResultSchema,
        },
      },
    },
    deleteNamedResourceHandler('sportCategory'),
  );
}
