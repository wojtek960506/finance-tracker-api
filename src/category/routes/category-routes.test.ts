import {
  FOOD_CATEGORY_ID_STR,
  getUpdateCategoryProps,
  getUserCategoryResultSerialized,
} from '@testing/factories/category';
import { USER_ID_STR } from '@testing/factories/general';
import Fastify from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { registerErrorHandler } from '@app/plugins/errorHandler';

import { categoryRoutes } from './category-routes';

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

describe('category routes', async () => {
  const app = Fastify().withTypeProvider<ZodTypeProvider>();
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.register(categoryRoutes);
  await registerErrorHandler(app);

  const categoryDTO = getUpdateCategoryProps();
  const categoryResult = getUserCategoryResultSerialized();
  const deleteResult = { acknowledged: true, deletedCount: 1 };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should get categories - 'GET /'", async () => {
    listImpl.mockResolvedValue([categoryResult]);

    const response = await app.inject({ method: 'GET', url: '/' });

    expect(listImpl).toHaveBeenCalledWith('category', USER_ID_STR);
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual([categoryResult]);
  });

  it("should get category - 'GET /:id'", async () => {
    getImpl.mockResolvedValue(categoryResult);

    const response = await app.inject({ method: 'GET', url: `/${FOOD_CATEGORY_ID_STR}` });

    expect(getImpl).toHaveBeenCalledWith('category', FOOD_CATEGORY_ID_STR, USER_ID_STR);
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(categoryResult);
  });

  it("should get favorite categories - 'GET /favorites'", async () => {
    getFavoritesImpl.mockResolvedValue([categoryResult]);

    const response = await app.inject({ method: 'GET', url: '/favorites' });

    expect(getFavoritesImpl).toHaveBeenCalledWith('category', USER_ID_STR);
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual([categoryResult]);
  });

  it("should create category - 'POST /'", async () => {
    createImpl.mockResolvedValue(categoryResult);

    const response = await app.inject({ method: 'POST', url: '/', body: categoryDTO });

    expect(createImpl).toHaveBeenCalledWith('category', USER_ID_STR, categoryDTO);
    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual(categoryResult);
  });

  it("should update category - 'PUT /:id'", async () => {
    updateImpl.mockResolvedValue(categoryResult);

    const response = await app.inject({
      method: 'PUT',
      url: `/${FOOD_CATEGORY_ID_STR}`,
      body: categoryDTO,
    });

    expect(updateImpl).toHaveBeenCalledWith(
      'category',
      FOOD_CATEGORY_ID_STR,
      USER_ID_STR,
      categoryDTO,
    );
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(categoryResult);
  });

  it("should favorite category - 'POST /:id/favorite'", async () => {
    favoriteImpl.mockResolvedValue(categoryResult);

    const response = await app.inject({
      method: 'POST',
      url: `/${FOOD_CATEGORY_ID_STR}/favorite`,
    });

    expect(favoriteImpl).toHaveBeenCalledWith(
      'category',
      FOOD_CATEGORY_ID_STR,
      USER_ID_STR,
    );
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(categoryResult);
  });

  it("should unfavorite category - 'DELETE /:id/favorite'", async () => {
    unfavoriteImpl.mockResolvedValue(deleteResult);

    const response = await app.inject({
      method: 'DELETE',
      url: `/${FOOD_CATEGORY_ID_STR}/favorite`,
    });

    expect(unfavoriteImpl).toHaveBeenCalledWith(
      'category',
      FOOD_CATEGORY_ID_STR,
      USER_ID_STR,
    );
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(deleteResult);
  });

  it("should delete category - 'DELETE /:id'", async () => {
    deleteImpl.mockResolvedValue(deleteResult);

    const response = await app.inject({
      method: 'DELETE',
      url: `/${FOOD_CATEGORY_ID_STR}`,
    });

    expect(deleteImpl).toHaveBeenCalledWith(
      'category',
      FOOD_CATEGORY_ID_STR,
      USER_ID_STR,
    );
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(deleteResult);
  });
});
