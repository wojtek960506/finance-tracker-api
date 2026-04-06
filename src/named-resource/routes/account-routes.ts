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

export async function accountRoutes(
  app: FastifyInstance & { withTypeProvider: <_T>() => any },
) {
  app.get<{ Reply: NamedResourcesResponseDTO }>(
    '/',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Accounts'],
        summary: 'List accounts',
        description: 'Return all accounts for the authenticated user.',
        response: {
          200: NamedResourcesResponseSchema,
        },
      },
    },
    getNamedResourcesHandler('account'),
  );

  app.get<{ Reply: NamedResourcesResponseDTO }>(
    '/favorites',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Accounts'],
        summary: 'List favorite accounts',
        description: 'Return all favorite accounts for the authenticated user.',
        response: {
          200: NamedResourcesResponseSchema,
        },
      },
    },
    getFavoriteNamedResourcesHandler('account'),
  );

  app.get<{ Params: ParamsJustId; Reply: NamedResourceResponseDTO }>(
    '/:id',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Accounts'],
        summary: 'Get account by id',
        description: 'Return a single account by id.',
        params: ParamsJustIdSchema,
        response: {
          200: NamedResourceResponseSchema,
        },
      },
    },
    getNamedResourceHandler('account'),
  );

  app.post<{ Body: NamedResourceDTO; Reply: NamedResourceResponseDTO }>(
    '/',
    {
      preHandler: [validateBody(NamedResourceSchema), authorizeAccessToken()],
      schema: {
        tags: ['Accounts'],
        summary: 'Create account',
        description: 'Create a new account for the authenticated user.',
        body: NamedResourceSchema,
        response: {
          201: NamedResourceResponseSchema,
        },
      },
    },
    createNamedResourceHandler('account'),
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
        tags: ['Accounts'],
        summary: 'Update account',
        description: 'Update an account by id.',
        params: ParamsJustIdSchema,
        body: NamedResourceSchema,
        response: {
          200: NamedResourceResponseSchema,
        },
      },
    },
    updateNamedResourceHandler('account'),
  );

  app.post<{ Params: ParamsJustId; Reply: NamedResourceResponseDTO }>(
    '/:id/favorite',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Accounts'],
        summary: 'Favorite account',
        description: 'Mark account as favorite for the authenticated user.',
        params: ParamsJustIdSchema,
        response: {
          200: NamedResourceResponseSchema,
        },
      },
    },
    favoriteNamedResourceHandler('account'),
  );

  app.delete<{ Params: ParamsJustId; Reply: DeleteResult }>(
    '/:id/favorite',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Accounts'],
        summary: 'Unfavorite account',
        description: 'Remove account from favorites for the authenticated user.',
        params: ParamsJustIdSchema,
        response: {
          200: DeleteResultSchema,
        },
      },
    },
    unfavoriteNamedResourceHandler('account'),
  );

  app.delete<{ Params: ParamsJustId; Reply: DeleteResult }>(
    '/:id',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Accounts'],
        summary: 'Delete account',
        description: 'Delete an account by id.',
        params: ParamsJustIdSchema,
        response: {
          200: DeleteResultSchema,
        },
      },
    },
    deleteNamedResourceHandler('account'),
  );
}
