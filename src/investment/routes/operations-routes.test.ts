import * as investmentServices from '@investment/services';
import Fastify from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { registerErrorHandler } from '@app/plugins/errorHandler';
import { USER_ID_STR } from '@testing/factories/general';

import { operationsRoutes } from './operations-routes';

const { createSnapshotOperationMock, getOperationsMock, deleteSnapshotOperationMock } =
  vi.hoisted(() => ({
    createSnapshotOperationMock: vi.fn(),
    getOperationsMock: vi.fn(),
    deleteSnapshotOperationMock: vi.fn(),
  }));

const mockPreHandler = vi.fn(async (req, _res) => {
  (req as any).userId = USER_ID_STR;
});

vi.mock('@auth/services', () => ({
  authorizeAccessToken: vi.fn(() => mockPreHandler),
}));

vi.mock('@investment/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@investment/services')>();
  return {
    ...actual,
    createSnapshotOperation: createSnapshotOperationMock,
    getOperations: getOperationsMock,
    deleteSnapshotOperation: deleteSnapshotOperationMock,
  };
});

describe('operations routes', async () => {
  const app = Fastify().withTypeProvider<ZodTypeProvider>();
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.register(operationsRoutes);
  await registerErrorHandler(app);

  const instrumentId = '507f1f77bcf86cd799439012';
  const operationId = '507f1f77bcf86cd799439013';

  const mockOperation = {
    id: operationId,
    ownerId: USER_ID_STR,
    instrumentId,
    kind: 'snapshot' as const,
    amount: 5000,
    currency: 'USD',
    date: new Date('2026-09-01').toISOString(),
    note: 'September snapshot',
    createdAt: new Date('2026-09-01').toISOString(),
    updatedAt: new Date('2026-09-01').toISOString(),
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('POST / - creates snapshot operation', async () => {
    createSnapshotOperationMock.mockResolvedValue(mockOperation);

    const response = await app.inject({
      method: 'POST',
      url: '/',
      body: {
        instrumentId,
        amount: 5000,
        currency: 'USD',
        date: '2026-09-01',
        note: 'September snapshot',
      },
    });

    expect(investmentServices.createSnapshotOperation).toHaveBeenCalledWith(
      USER_ID_STR,
      expect.objectContaining({
        instrumentId,
        amount: 5000,
        currency: 'USD',
        note: 'September snapshot',
      }),
    );
    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual(mockOperation);
  });

  it('GET / - lists operations', async () => {
    getOperationsMock.mockResolvedValue([mockOperation]);

    const response = await app.inject({
      method: 'GET',
      url: `/?instrumentId=${instrumentId}`,
    });

    expect(investmentServices.getOperations).toHaveBeenCalledWith(
      USER_ID_STR,
      expect.objectContaining({
        instrumentId,
      }),
    );
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual([mockOperation]);
  });

  it('DELETE /:id - deletes snapshot operation', async () => {
    deleteSnapshotOperationMock.mockResolvedValue({ id: operationId });

    const response = await app.inject({
      method: 'DELETE',
      url: `/${operationId}`,
    });

    expect(investmentServices.deleteSnapshotOperation).toHaveBeenCalledWith(
      USER_ID_STR,
      operationId,
    );
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ id: operationId });
  });
});
