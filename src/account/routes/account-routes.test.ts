import {
  ACCOUNT_EXPENSE_ID_STR,
  getUpdateAccountProps,
  getUserAccountResultJSON,
  getUserAccountResultSerialized,
} from '@testing/factories/account';
import { USER_ID_STR } from '@testing/factories/general';
import Fastify from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { afterEach, describe, expect, it, vi } from 'vitest';

import * as dbAccounts from '@account/db';
import * as accountServices from '@account/services';
import { registerErrorHandler } from '@app/plugins/errorHandler';

import { accountRoutes } from './account-routes';

const mockPreHandler = vi.fn(async (req, _res) => {
  (req as any).userId = USER_ID_STR;
});

vi.mock('@auth/services', () => ({ authorizeAccessToken: vi.fn(() => mockPreHandler) }));

describe('account routes', async () => {
  const app = Fastify().withTypeProvider<ZodTypeProvider>();
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.register(accountRoutes);
  await registerErrorHandler(app);

  const accountDTO = getUpdateAccountProps();
  const accountResult = getUserAccountResultSerialized();
  const deleteResult = { acknowledged: true, deletedCount: 1 };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should get accounts - 'GET /'", async () => {
    vi.spyOn(dbAccounts, 'findAccounts').mockResolvedValue([
      {
        toObject: () => getUserAccountResultJSON(),
      },
    ] as any);

    const response = await app.inject({ method: 'GET', url: '/' });

    expect(dbAccounts.findAccounts).toHaveBeenCalledOnce();
    expect(dbAccounts.findAccounts).toHaveBeenCalledWith(USER_ID_STR);
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual([getUserAccountResultSerialized()]);
  });

  it("should get account - 'GET /:id'", async () => {
    vi.spyOn(accountServices, 'getAccount').mockResolvedValue(accountResult as any);

    const response = await app.inject({
      method: 'GET',
      url: `/${ACCOUNT_EXPENSE_ID_STR}`,
    });

    expect(accountServices.getAccount).toHaveBeenCalledOnce();
    expect(accountServices.getAccount).toHaveBeenCalledWith(
      ACCOUNT_EXPENSE_ID_STR,
      USER_ID_STR,
    );
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(accountResult);
  });

  it("should get favorite accounts - 'GET /favorites'", async () => {
    vi.spyOn(accountServices, 'getFavoriteAccounts').mockResolvedValue([accountResult] as any);

    const response = await app.inject({ method: 'GET', url: '/favorites' });

    expect(accountServices.getFavoriteAccounts).toHaveBeenCalledOnce();
    expect(accountServices.getFavoriteAccounts).toHaveBeenCalledWith(USER_ID_STR);
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual([accountResult]);
  });

  it("should create account - 'POST /'", async () => {
    vi.spyOn(accountServices, 'createAccount').mockResolvedValue(accountResult as any);

    const response = await app.inject({
      method: 'POST',
      url: '/',
      body: accountDTO,
    });

    expect(accountServices.createAccount).toHaveBeenCalledOnce();
    expect(accountServices.createAccount).toHaveBeenCalledWith(USER_ID_STR, accountDTO);
    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual(accountResult);
  });

  it("should update account - 'PUT /:id'", async () => {
    vi.spyOn(accountServices, 'updateAccount').mockResolvedValue(accountResult as any);

    const response = await app.inject({
      method: 'PUT',
      url: `/${ACCOUNT_EXPENSE_ID_STR}`,
      body: accountDTO,
    });

    expect(accountServices.updateAccount).toHaveBeenCalledOnce();
    expect(accountServices.updateAccount).toHaveBeenCalledWith(
      ACCOUNT_EXPENSE_ID_STR,
      USER_ID_STR,
      accountDTO,
    );
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(accountResult);
  });

  it("should favorite account - 'POST /:id/favorite'", async () => {
    vi.spyOn(accountServices, 'favoriteAccount').mockResolvedValue(accountResult as any);

    const response = await app.inject({
      method: 'POST',
      url: `/${ACCOUNT_EXPENSE_ID_STR}/favorite`,
    });

    expect(accountServices.favoriteAccount).toHaveBeenCalledOnce();
    expect(accountServices.favoriteAccount).toHaveBeenCalledWith(
      ACCOUNT_EXPENSE_ID_STR,
      USER_ID_STR,
    );
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(accountResult);
  });

  it("should unfavorite account - 'DELETE /:id/favorite'", async () => {
    vi.spyOn(accountServices, 'unfavoriteAccount').mockResolvedValue(deleteResult as any);

    const response = await app.inject({
      method: 'DELETE',
      url: `/${ACCOUNT_EXPENSE_ID_STR}/favorite`,
    });

    expect(accountServices.unfavoriteAccount).toHaveBeenCalledOnce();
    expect(accountServices.unfavoriteAccount).toHaveBeenCalledWith(
      ACCOUNT_EXPENSE_ID_STR,
      USER_ID_STR,
    );
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(deleteResult);
  });

  it("should delete account - 'DELETE /:id'", async () => {
    vi.spyOn(accountServices, 'deleteAccount').mockResolvedValue(deleteResult as any);

    const response = await app.inject({
      method: 'DELETE',
      url: `/${ACCOUNT_EXPENSE_ID_STR}`,
    });

    expect(accountServices.deleteAccount).toHaveBeenCalledOnce();
    expect(accountServices.deleteAccount).toHaveBeenCalledWith(
      ACCOUNT_EXPENSE_ID_STR,
      USER_ID_STR,
    );
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(deleteResult);
  });
});
