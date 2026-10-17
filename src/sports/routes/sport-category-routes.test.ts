import Fastify from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { registerErrorHandler } from '@app/plugins/errorHandler';
import { USER_ID_STR } from '@testing/factories/general';

import { sportCategoryRoutes } from './sport-category-routes';

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

vi.mock('@auth/services', () => ({
  authorizeAccessToken: vi.fn(() => mockPreHandler),
}));
vi.mock('@named-resource/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@named-resource/services')>();
  return {
    ...actual,
    createNamedResource: createImpl,
    deleteNamedResource: deleteImpl,
    getNamedResource: getImpl,
    listNamedResources: listImpl,
    updateNamedResource: updateImpl,
  };
});
vi.mock('@named-resource-favorite/services', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@named-resource-favorite/services')>();
  return {
    ...actual,
    favoriteNamedResource: favoriteImpl,
    getFavoriteNamedResources: getFavoritesImpl,
    unfavoriteNamedResource: unfavoriteImpl,
  };
});

describe('sportCategoryRoutes', async () => {
  const app = Fastify().withTypeProvider<ZodTypeProvider>();
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.register(sportCategoryRoutes);
  await registerErrorHandler(app);

  const sportCategoryId = '665000000000000000000002';
  const sportCategoryDTO = { name: 'Climbing' };
  const sportCategoryResult = {
    id: sportCategoryId,
    type: 'user',
    name: 'Climbing',
    nameNormalized: 'climbing',
    isFavorite: false,
  };
  const deleteResult = { acknowledged: true, deletedCount: 1 };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should get sport categories - 'GET /'", async () => {
    listImpl.mockResolvedValue([sportCategoryResult]);

    const response = await app.inject({ method: 'GET', url: '/' });

    expect(listImpl).toHaveBeenCalledWith('sportCategory', USER_ID_STR);
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual([sportCategoryResult]);
  });

  it("should get sport category - 'GET /:id'", async () => {
    getImpl.mockResolvedValue(sportCategoryResult);

    const response = await app.inject({ method: 'GET', url: `/${sportCategoryId}` });

    expect(getImpl).toHaveBeenCalledWith('sportCategory', sportCategoryId, USER_ID_STR);
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(sportCategoryResult);
  });

  it("should get favorite sport categories - 'GET /favorites'", async () => {
    getFavoritesImpl.mockResolvedValue([sportCategoryResult]);

    const response = await app.inject({ method: 'GET', url: '/favorites' });

    expect(getFavoritesImpl).toHaveBeenCalledWith('sportCategory', USER_ID_STR);
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual([sportCategoryResult]);
  });

  it("should create sport category - 'POST /'", async () => {
    createImpl.mockResolvedValue(sportCategoryResult);

    const response = await app.inject({
      method: 'POST',
      url: '/',
      body: sportCategoryDTO,
    });

    expect(createImpl).toHaveBeenCalledWith(
      'sportCategory',
      USER_ID_STR,
      sportCategoryDTO,
    );
    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual(sportCategoryResult);
  });

  it("should update sport category via PUT - 'PUT /:id'", async () => {
    updateImpl.mockResolvedValue(sportCategoryResult);

    const response = await app.inject({
      method: 'PUT',
      url: `/${sportCategoryId}`,
      body: sportCategoryDTO,
    });

    expect(updateImpl).toHaveBeenCalledWith(
      'sportCategory',
      sportCategoryId,
      USER_ID_STR,
      sportCategoryDTO,
    );
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(sportCategoryResult);
  });

  it("should update sport category via PATCH - 'PATCH /:id'", async () => {
    updateImpl.mockResolvedValue(sportCategoryResult);

    const response = await app.inject({
      method: 'PATCH',
      url: `/${sportCategoryId}`,
      body: sportCategoryDTO,
    });

    expect(updateImpl).toHaveBeenCalledWith(
      'sportCategory',
      sportCategoryId,
      USER_ID_STR,
      sportCategoryDTO,
    );
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(sportCategoryResult);
  });

  it("should favorite sport category - 'POST /:id/favorite'", async () => {
    favoriteImpl.mockResolvedValue(sportCategoryResult);

    const response = await app.inject({
      method: 'POST',
      url: `/${sportCategoryId}/favorite`,
    });

    expect(favoriteImpl).toHaveBeenCalledWith(
      'sportCategory',
      sportCategoryId,
      USER_ID_STR,
    );
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(sportCategoryResult);
  });

  it("should unfavorite sport category - 'DELETE /:id/favorite'", async () => {
    unfavoriteImpl.mockResolvedValue(deleteResult);

    const response = await app.inject({
      method: 'DELETE',
      url: `/${sportCategoryId}/favorite`,
    });

    expect(unfavoriteImpl).toHaveBeenCalledWith(
      'sportCategory',
      sportCategoryId,
      USER_ID_STR,
    );
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(deleteResult);
  });

  it("should delete sport category - 'DELETE /:id'", async () => {
    deleteImpl.mockResolvedValue(deleteResult);

    const response = await app.inject({
      method: 'DELETE',
      url: `/${sportCategoryId}`,
    });

    expect(deleteImpl).toHaveBeenCalledWith(
      'sportCategory',
      sportCategoryId,
      USER_ID_STR,
    );
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(deleteResult);
  });
});
