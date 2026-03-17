import { FastifyInstance } from 'fastify';
import { DeleteResult } from 'mongoose';
import { z } from 'zod/v4';

import {
  AccountDTO,
  AccountResponseDTO,
  AccountResponseSchema,
  AccountSchema,
  AccountsResponseDTO,
  AccountsResponseSchema,
} from '@account/schema';
import { authorizeAccessToken } from '@auth/services';
import { ParamsJustId } from '@shared/http';
import { validateBody } from '@utils/validation';

import {
  createAccountHandler,
  deleteAccountHandler,
  getAccountHandler,
  getAccountsHandler,
  updateAccountHandler,
} from './handlers';

export async function accountRoutes(
  app: FastifyInstance & { withTypeProvider: <_T>() => any },
) {
  const ParamsJustIdSchema = z.object({
    id: z.string().describe('Account id'),
  });

  const DeleteResultSchema = z.object({
    acknowledged: z.boolean(),
    deletedCount: z.number(),
  });

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
    getAccountsHandler,
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
    getAccountHandler,
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
    createAccountHandler,
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
    updateAccountHandler,
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
    deleteAccountHandler,
  );
}
