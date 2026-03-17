import { FastifyInstance } from 'fastify';
import { DeleteResult } from 'mongoose';

import {
  AccountDTO,
  AccountResponseDTO,
  AccountSchema,
  AccountsResponseDTO,
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
  app.get<{ Reply: AccountsResponseDTO }>(
    '/',
    { preHandler: authorizeAccessToken() },
    getAccountsHandler,
  );

  app.get<{ Params: ParamsJustId; Reply: AccountResponseDTO }>(
    '/:id',
    { preHandler: authorizeAccessToken() },
    getAccountHandler,
  );

  app.post<{ Body: AccountDTO; Reply: AccountResponseDTO }>(
    '/',
    { preHandler: [validateBody(AccountSchema), authorizeAccessToken()] },
    createAccountHandler,
  );

  app.put<{ Params: ParamsJustId; Body: AccountDTO; Reply: AccountResponseDTO }>(
    '/:id',
    { preHandler: [validateBody(AccountSchema), authorizeAccessToken()] },
    updateAccountHandler,
  );

  app.delete<{ Params: ParamsJustId; Reply: DeleteResult }>(
    '/:id',
    { preHandler: authorizeAccessToken() },
    deleteAccountHandler,
  );
}
