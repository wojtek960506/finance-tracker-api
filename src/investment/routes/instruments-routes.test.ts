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

import { instrumentsRoutes } from './instruments-routes';

const {
  createInstrumentMock,
  getInstrumentsMock,
  getInstrumentByIdMock,
  updateInstrumentMock,
  deleteInstrumentMock,
} = vi.hoisted(() => ({
  createInstrumentMock: vi.fn(),
  getInstrumentsMock: vi.fn(),
  getInstrumentByIdMock: vi.fn(),
  updateInstrumentMock: vi.fn(),
  deleteInstrumentMock: vi.fn(),
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
    createInstrument: createInstrumentMock,
    getInstruments: getInstrumentsMock,
    getInstrumentById: getInstrumentByIdMock,
    updateInstrument: updateInstrumentMock,
    deleteInstrument: deleteInstrumentMock,
  };
});

describe('instruments routes', async () => {
  const app = Fastify().withTypeProvider<ZodTypeProvider>();
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.register(instrumentsRoutes);
  await registerErrorHandler(app);

  const instrumentId = '507f1f77bcf86cd799439012';

  const mockInstrument = {
    id: instrumentId,
    ownerId: USER_ID_STR,
    name: 'VWCE ETF',
    nameNormalized: 'vwce etf',
    kind: 'fund' as const,
    currency: 'USD',
    notes: 'Vanguard All-World',
    createdAt: new Date('2026-01-01').toISOString(),
    updatedAt: new Date('2026-01-01').toISOString(),
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('POST / - creates instrument', async () => {
    createInstrumentMock.mockResolvedValue(mockInstrument);

    const response = await app.inject({
      method: 'POST',
      url: '/',
      body: {
        name: 'VWCE ETF',
        kind: 'fund',
        currency: 'USD',
        notes: 'Vanguard All-World',
      },
    });

    expect(investmentServices.createInstrument).toHaveBeenCalledWith(USER_ID_STR, {
      name: 'VWCE ETF',
      kind: 'fund',
      currency: 'USD',
      notes: 'Vanguard All-World',
    });
    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual(mockInstrument);
  });

  it('GET / - lists instruments', async () => {
    getInstrumentsMock.mockResolvedValue([mockInstrument]);

    const response = await app.inject({
      method: 'GET',
      url: '/?kind=fund',
    });

    expect(investmentServices.getInstruments).toHaveBeenCalledWith(USER_ID_STR, {
      kind: 'fund',
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual([mockInstrument]);
  });

  it('GET /:id - gets instrument by id', async () => {
    getInstrumentByIdMock.mockResolvedValue(mockInstrument);

    const response = await app.inject({
      method: 'GET',
      url: `/${instrumentId}`,
    });

    expect(investmentServices.getInstrumentById).toHaveBeenCalledWith(
      USER_ID_STR,
      instrumentId,
    );
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(mockInstrument);
  });

  it('PATCH /:id - updates instrument', async () => {
    updateInstrumentMock.mockResolvedValue(mockInstrument);

    const response = await app.inject({
      method: 'PATCH',
      url: `/${instrumentId}`,
      body: {
        name: 'VWCE ETF Updated',
      },
    });

    expect(investmentServices.updateInstrument).toHaveBeenCalledWith(
      USER_ID_STR,
      instrumentId,
      {
        name: 'VWCE ETF Updated',
      },
    );
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(mockInstrument);
  });

  it('DELETE /:id - deletes instrument', async () => {
    deleteInstrumentMock.mockResolvedValue({ id: instrumentId });

    const response = await app.inject({
      method: 'DELETE',
      url: `/${instrumentId}`,
    });

    expect(investmentServices.deleteInstrument).toHaveBeenCalledWith(
      USER_ID_STR,
      instrumentId,
    );
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ id: instrumentId });
  });
});
