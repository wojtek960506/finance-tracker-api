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

const {
  createOperationMock,
  getOperationsMock,
  updateOperationMock,
  deleteOperationMock,
} = vi.hoisted(() => ({
  createOperationMock: vi.fn(),
  getOperationsMock: vi.fn(),
  updateOperationMock: vi.fn(),
  deleteOperationMock: vi.fn(),
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
    createOperation: createOperationMock,
    getOperations: getOperationsMock,
    updateOperation: updateOperationMock,
    deleteOperation: deleteOperationMock,
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

  it('POST / - creates operation', async () => {
    createOperationMock.mockResolvedValue(mockOperation);

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

    expect(investmentServices.createOperation).toHaveBeenCalledWith(
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

  it('PATCH /:id - updates operation with all fields', async () => {
    const updatedOperation = {
      ...mockOperation,
      amount: 14500.5,
      note: 'Updated notes',
    };
    updateOperationMock.mockResolvedValue(updatedOperation);

    const response = await app.inject({
      method: 'PATCH',
      url: `/${operationId}`,
      body: {
        instrumentId,
        amount: 14500.5,
        currency: 'USD',
        date: '2026-09-17',
        notes: 'Updated notes',
      },
    });

    expect(investmentServices.updateOperation).toHaveBeenCalledWith(
      USER_ID_STR,
      operationId,
      expect.objectContaining({
        instrumentId,
        amount: 14500.5,
        currency: 'USD',
        notes: 'Updated notes',
      }),
    );
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(updatedOperation);
  });

  it('PATCH /:id - updates operation partially', async () => {
    const updatedOperation = {
      ...mockOperation,
      amount: 6000,
    };
    updateOperationMock.mockResolvedValue(updatedOperation);

    const response = await app.inject({
      method: 'PATCH',
      url: `/${operationId}`,
      body: {
        amount: 6000,
      },
    });

    expect(investmentServices.updateOperation).toHaveBeenCalledWith(
      USER_ID_STR,
      operationId,
      expect.objectContaining({
        amount: 6000,
      }),
    );
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(updatedOperation);
  });

  it('DELETE /:id - deletes operation', async () => {
    deleteOperationMock.mockResolvedValue({ id: operationId });

    const response = await app.inject({
      method: 'DELETE',
      url: `/${operationId}`,
    });

    expect(investmentServices.deleteOperation).toHaveBeenCalledWith(
      USER_ID_STR,
      operationId,
    );
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ id: operationId });
  });
});
