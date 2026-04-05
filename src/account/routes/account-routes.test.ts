import {
  ACCOUNT_EXPENSE_ID_STR,
  getUpdateAccountProps,
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

import { registerErrorHandler } from '@app/plugins/errorHandler';
import * as namedResourceServices from '@shared/named-resource/services';

import { accountRoutes } from './account-routes';

const {
  createImpl,
  deleteImpl,
  favoriteImpl,
  getFavoritesImpl,
  getImpl,
  listImpl,
  unfavoriteImpl,
  updateImpl,
} = vi.hoisted(() => ({
  createImpl: vi.fn(),
  deleteImpl: vi.fn(),
  favoriteImpl: vi.fn(),
  getFavoritesImpl: vi.fn(),
  getImpl: vi.fn(),
  listImpl: vi.fn(),
  unfavoriteImpl: vi.fn(),
  updateImpl: vi.fn(),
}));

const mockPreHandler = vi.fn(async (req, _res) => {
  (req as any).userId = USER_ID_STR;
});

vi.mock('@auth/services', () => ({ authorizeAccessToken: vi.fn(() => mockPreHandler) }));
vi.mock('@shared/named-resource/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@shared/named-resource/services')>();
  return {
    ...actual,
    createNamedResource: createImpl,
    deleteNamedResource: deleteImpl,
    favoriteNamedResource: favoriteImpl,
    getFavoriteNamedResources: getFavoritesImpl,
    getNamedResource: getImpl,
    listNamedResources: listImpl,
    unfavoriteNamedResource: unfavoriteImpl,
    updateNamedResource: updateImpl,
  };
});

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
    listImpl.mockResolvedValue([accountResult]);

    const response = await app.inject({ method: 'GET', url: '/' });

    expect(namedResourceServices.listNamedResources).toHaveBeenCalledWith(
      'account',
      USER_ID_STR,
    );
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual([accountResult]);
  });

  it("should get account - 'GET /:id'", async () => {
    getImpl.mockResolvedValue(accountResult);

    const response = await app.inject({
      method: 'GET',
      url: `/${ACCOUNT_EXPENSE_ID_STR}`,
    });

    expect(getImpl).toHaveBeenCalledWith('account', ACCOUNT_EXPENSE_ID_STR, USER_ID_STR);
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(accountResult);
  });

  it("should get favorite accounts - 'GET /favorites'", async () => {
    getFavoritesImpl.mockResolvedValue([accountResult]);

    const response = await app.inject({ method: 'GET', url: '/favorites' });

    expect(getFavoritesImpl).toHaveBeenCalledWith('account', USER_ID_STR);
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual([accountResult]);
  });

  it("should create account - 'POST /'", async () => {
    createImpl.mockResolvedValue(accountResult);

    const response = await app.inject({
      method: 'POST',
      url: '/',
      body: accountDTO,
    });

    expect(createImpl).toHaveBeenCalledWith('account', USER_ID_STR, accountDTO);
    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual(accountResult);
  });

  it("should update account - 'PUT /:id'", async () => {
    updateImpl.mockResolvedValue(accountResult);

    const response = await app.inject({
      method: 'PUT',
      url: `/${ACCOUNT_EXPENSE_ID_STR}`,
      body: accountDTO,
    });

    expect(updateImpl).toHaveBeenCalledWith(
      'account',
      ACCOUNT_EXPENSE_ID_STR,
      USER_ID_STR,
      accountDTO,
    );
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(accountResult);
  });

  it("should favorite account - 'POST /:id/favorite'", async () => {
    favoriteImpl.mockResolvedValue(accountResult);

    const response = await app.inject({
      method: 'POST',
      url: `/${ACCOUNT_EXPENSE_ID_STR}/favorite`,
    });

    expect(favoriteImpl).toHaveBeenCalledWith(
      'account',
      ACCOUNT_EXPENSE_ID_STR,
      USER_ID_STR,
    );
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(accountResult);
  });

  it("should unfavorite account - 'DELETE /:id/favorite'", async () => {
    unfavoriteImpl.mockResolvedValue(deleteResult);

    const response = await app.inject({
      method: 'DELETE',
      url: `/${ACCOUNT_EXPENSE_ID_STR}/favorite`,
    });

    expect(unfavoriteImpl).toHaveBeenCalledWith(
      'account',
      ACCOUNT_EXPENSE_ID_STR,
      USER_ID_STR,
    );
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(deleteResult);
  });

  it("should delete account - 'DELETE /:id'", async () => {
    deleteImpl.mockResolvedValue(deleteResult);

    const response = await app.inject({
      method: 'DELETE',
      url: `/${ACCOUNT_EXPENSE_ID_STR}`,
    });

    expect(deleteImpl).toHaveBeenCalledWith(
      'account',
      ACCOUNT_EXPENSE_ID_STR,
      USER_ID_STR,
    );
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(deleteResult);
  });
});
