import {
  FOOD_CATEGORY_ID_STR,
  getUpdateCategoryProps,
  getUserCategoryResultJSON,
  getUserCategoryResultSerialized,
} from '@testing/factories/category';
import { USER_ID_STR } from '@testing/factories/general';
import Fastify from 'fastify';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { registerErrorHandler } from '@app/plugins/errorHandler';
import * as dbC from '@category/db';
import * as serviceC from '@category/services';

import { categoryRoutes } from './category-routes';

const MOCKED_RESULT = { result: 'result' };
const mockPreHandler = vi.fn(async (req, _res) => {
  (req as any).userId = USER_ID_STR;
});

vi.mock('@auth/services', () => ({ authorizeAccessToken: vi.fn(() => mockPreHandler) }));

describe('category routes', async () => {
  const app = Fastify();
  app.register(categoryRoutes);
  await registerErrorHandler(app);

  const categoryDTO = getUpdateCategoryProps();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should get categories - 'GET /'", async () => {
    vi.spyOn(dbC, 'findCategories').mockResolvedValue([
      {
        toObject: () => getUserCategoryResultJSON(),
      },
    ] as any);

    const response = await app.inject({ method: 'GET', url: '/' });

    expect(dbC.findCategories).toHaveBeenCalledOnce();
    expect(dbC.findCategories).toHaveBeenCalledWith(USER_ID_STR);
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual([getUserCategoryResultSerialized()]);
  });

  it("should get category - 'GET /:id'", async () => {
    vi.spyOn(serviceC, 'getCategory').mockResolvedValue(MOCKED_RESULT as any);

    const response = await app.inject({ method: 'GET', url: `/${FOOD_CATEGORY_ID_STR}` });

    expect(serviceC.getCategory).toHaveBeenCalledOnce();
    expect(serviceC.getCategory).toHaveBeenCalledWith(FOOD_CATEGORY_ID_STR, USER_ID_STR);
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(MOCKED_RESULT);
  });

  it("should create category - 'POST /'", async () => {
    vi.spyOn(serviceC, 'createCategory').mockResolvedValue(MOCKED_RESULT as any);

    const response = await app.inject({ method: 'POST', url: '/', body: categoryDTO });

    expect(serviceC.createCategory).toHaveBeenCalledOnce();
    expect(serviceC.createCategory).toHaveBeenCalledWith(USER_ID_STR, categoryDTO);
    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual(MOCKED_RESULT);
  });

  it("should update category - 'PUT /:id'", async () => {
    vi.spyOn(serviceC, 'updateCategory').mockResolvedValue(MOCKED_RESULT as any);

    const response = await app.inject({
      method: 'PUT',
      url: `/${FOOD_CATEGORY_ID_STR}`,
      body: categoryDTO,
    });

    expect(serviceC.updateCategory).toHaveBeenCalledOnce();
    expect(serviceC.updateCategory).toHaveBeenCalledWith(
      FOOD_CATEGORY_ID_STR,
      USER_ID_STR,
      categoryDTO,
    );
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(MOCKED_RESULT);
  });

  it("should delete category - 'DELETE /:id'", async () => {
    vi.spyOn(serviceC, 'deleteCategory').mockResolvedValue(MOCKED_RESULT as any);

    const response = await app.inject({
      method: 'DELETE',
      url: `/${FOOD_CATEGORY_ID_STR}`,
    });

    expect(serviceC.deleteCategory).toHaveBeenCalledOnce();
    expect(serviceC.deleteCategory).toHaveBeenCalledWith(
      FOOD_CATEGORY_ID_STR,
      USER_ID_STR,
    );
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(MOCKED_RESULT);
  });
});
