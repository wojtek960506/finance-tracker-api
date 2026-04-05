import { FastifyInstance } from 'fastify';
import { DeleteResult } from 'mongoose';

import {
  AccountDTO,
  AccountResponseDTO,
  AccountResponseSchema,
  AccountSchema,
  AccountsResponseDTO,
  AccountsResponseSchema,
} from '@account/schema';
import { authorizeAccessToken } from '@auth/services';
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

export async function accountRoutes(
  app: FastifyInstance & { withTypeProvider: <_T>() => any },
) {
  app.get<{ Reply: AccountsResponseDTO }>(
    '/',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Accounts'],
        summary: 'List accounts',
        description: 'Return all accounts for the authenticated user.',
        response: {
          200: AccountsResponseSchema,
        },
      },
    },
    getNamedResourcesHandler('account'),
  );

  app.get<{ Reply: AccountsResponseDTO }>(
    '/favorites',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Accounts'],
        summary: 'List favorite accounts',
        description: 'Return all favorite accounts for the authenticated user.',
        response: {
          200: AccountsResponseSchema,
        },
      },
    },
    getFavoriteNamedResourcesHandler('account'),
  );

  app.get<{ Params: ParamsJustId; Reply: AccountResponseDTO }>(
    '/:id',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Accounts'],
        summary: 'Get account by id',
        description: 'Return a single account by id.',
        params: ParamsJustIdSchema,
        response: {
          200: AccountResponseSchema,
        },
      },
    },
    getNamedResourceHandler('account'),
  );

  app.post<{ Body: AccountDTO; Reply: AccountResponseDTO }>(
    '/',
    {
      preHandler: [validateBody(AccountSchema), authorizeAccessToken()],
      schema: {
        tags: ['Accounts'],
        summary: 'Create account',
        description: 'Create a new account for the authenticated user.',
        body: AccountSchema,
        response: {
          201: AccountResponseSchema,
        },
      },
    },
    createNamedResourceHandler('account'),
  );

  app.put<{ Params: ParamsJustId; Body: AccountDTO; Reply: AccountResponseDTO }>(
    '/:id',
    {
      preHandler: [validateBody(AccountSchema), authorizeAccessToken()],
      schema: {
        tags: ['Accounts'],
        summary: 'Update account',
        description: 'Update an account by id.',
        params: ParamsJustIdSchema,
        body: AccountSchema,
        response: {
          200: AccountResponseSchema,
        },
      },
    },
    updateNamedResourceHandler('account'),
  );

  app.post<{ Params: ParamsJustId; Reply: AccountResponseDTO }>(
    '/:id/favorite',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Accounts'],
        summary: 'Favorite account',
        description: 'Mark account as favorite for the authenticated user.',
        params: ParamsJustIdSchema,
        response: {
          200: AccountResponseSchema,
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
