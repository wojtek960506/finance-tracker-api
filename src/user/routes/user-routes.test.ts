import { USER_ID_STR } from '@testing/factories/general';
import {
  getUserDTO,
  getUserResultSerialized,
  TEST_USER_TOTAL_TRANSACTIONS,
  TEST_USER_USERNAME,
  USER_EMAIL,
} from '@testing/factories/user';
import Fastify from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { registerErrorHandler } from '@app/plugins/errorHandler';
import * as serviceU from '@user/services';

import { userRoutes } from './user-routes';

const mockPreHandler = vi.fn(async (req, _res) => {
  (req as any).userId = USER_ID_STR;
});

vi.mock('@auth/services', () => ({ authorizeAccessToken: vi.fn(() => mockPreHandler) }));

describe('user routes', async () => {
  const app = Fastify().withTypeProvider<ZodTypeProvider>();
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.register(userRoutes);
  await registerErrorHandler(app);

  const userDTO = getUserDTO();
  const userResult = getUserResultSerialized();
  const usersResult = [userResult];
  const testUserResult = {
    userId: USER_ID_STR,
    email: USER_EMAIL,
    insertedTransactionsCount: TEST_USER_TOTAL_TRANSACTIONS,
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should get users - 'GET /'", async () => {
    vi.spyOn(serviceU, 'getUsers').mockResolvedValue(usersResult as any);

    const response = await app.inject({ method: 'GET', url: '/' });

    expect(serviceU.getUsers).toHaveBeenCalledOnce();
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(usersResult);
  });

  it("should get user - 'GET /:id'", async () => {
    vi.spyOn(serviceU, 'getUser').mockResolvedValue(userResult as any);

    const response = await app.inject({ method: 'GET', url: `/${USER_ID_STR}` });

    expect(serviceU.getUser).toHaveBeenCalledOnce();
    expect(serviceU.getUser).toHaveBeenCalledWith(USER_ID_STR, USER_ID_STR);
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(userResult);
  });

  it("should create user - 'POST /'", async () => {
    vi.spyOn(serviceU, 'createUser').mockResolvedValue(userResult as any);

    const response = await app.inject({ method: 'POST', url: '/', body: userDTO });

    expect(serviceU.createUser).toHaveBeenCalledOnce();
    expect(serviceU.createUser).toHaveBeenCalledWith(userDTO);
    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual(userResult);
  });

  it("should create test user - 'POST /test'", async () => {
    const body = {
      username: TEST_USER_USERNAME,
      totalTransactions: TEST_USER_TOTAL_TRANSACTIONS,
    };
    vi.spyOn(serviceU, 'createTestUser').mockResolvedValue(testUserResult as any);

    const response = await app.inject({ method: 'POST', url: '/test', body });

    expect(serviceU.createTestUser).toHaveBeenCalledOnce();
    expect(serviceU.createTestUser).toHaveBeenCalledWith(body);
    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual(testUserResult);
  });

  it("should delete user - 'DELETE /:id'", async () => {
    vi.spyOn(serviceU, 'deleteUser').mockResolvedValue(userResult as any);

    const response = await app.inject({ method: 'DELETE', url: `/${USER_ID_STR}` });

    expect(serviceU.deleteUser).toHaveBeenCalledOnce();
    expect(serviceU.deleteUser).toHaveBeenCalledWith(USER_ID_STR, USER_ID_STR);
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(userResult);
  });
});
