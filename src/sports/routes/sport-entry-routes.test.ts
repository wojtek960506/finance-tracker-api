import Fastify from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { Types } from 'mongoose';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { registerErrorHandler } from '@app/plugins/errorHandler';
import { USER_ID_STR } from '@testing/factories/general';

import { sportEntryRoutes } from './sport-entry-routes';

const {
  createSportEntryImpl,
  listSportEntriesImpl,
  getSportEntryImpl,
  updateSportEntryImpl,
  deleteSportEntryImpl,
} = vi.hoisted(() => ({
  createSportEntryImpl: vi.fn(),
  listSportEntriesImpl: vi.fn(),
  getSportEntryImpl: vi.fn(),
  updateSportEntryImpl: vi.fn(),
  deleteSportEntryImpl: vi.fn(),
}));

const mockPreHandler = vi.fn(async (req, _res) => {
  (req as any).userId = USER_ID_STR;
});

vi.mock('@auth/services', () => ({
  authorizeAccessToken: vi.fn(() => mockPreHandler),
}));

vi.mock('../services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services')>();
  return {
    ...actual,
    createSportEntry: createSportEntryImpl,
    listSportEntries: listSportEntriesImpl,
    getSportEntry: getSportEntryImpl,
    updateSportEntry: updateSportEntryImpl,
    deleteSportEntry: deleteSportEntryImpl,
  };
});

const buildTestApp = () => {
  const app = Fastify({ logger: false }).withTypeProvider<ZodTypeProvider>();
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  registerErrorHandler(app);
  app.register(sportEntryRoutes);
  return app;
};

describe('sportEntryRoutes', () => {
  const entryId = new Types.ObjectId().toString();
  const categoryId = new Types.ObjectId().toString();
  const dateStr = '2026-05-08T00:00:00.000Z';
  const now = new Date();

  const mockSerializedEntry = {
    id: entryId,
    ownerId: USER_ID_STR,
    categoryId,
    category: {
      id: categoryId,
      name: 'Running',
      type: 'user',
    },
    date: now,
    itemName: 'Shoes',
    costPln: 250,
    description: null,
    transactionId: null,
    createdAt: now,
    updatedAt: now,
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('GET / lists sport entries', async () => {
    listSportEntriesImpl.mockResolvedValue({
      items: [mockSerializedEntry],
      pagination: { total: 1, page: 1, limit: 50, totalPages: 1 },
    });

    const app = buildTestApp();
    const res = await app.inject({
      method: 'GET',
      url: '/?sort=date_desc&page=1',
    });

    expect(res.statusCode).toBe(200);
    expect(listSportEntriesImpl).toHaveBeenCalledWith(
      USER_ID_STR,
      expect.objectContaining({ sort: 'date_desc', page: 1 }),
    );
  });

  it('POST / creates a new sport entry', async () => {
    createSportEntryImpl.mockResolvedValue(mockSerializedEntry);

    const app = buildTestApp();
    const res = await app.inject({
      method: 'POST',
      url: '/',
      payload: {
        categoryId,
        date: dateStr,
        itemName: 'Shoes',
        costPln: 250,
      },
    });

    expect(res.statusCode).toBe(201);
    expect(createSportEntryImpl).toHaveBeenCalledWith(
      USER_ID_STR,
      expect.objectContaining({ itemName: 'Shoes', costPln: 250 }),
    );
  });

  it('GET /:id returns a sport entry by id', async () => {
    getSportEntryImpl.mockResolvedValue(mockSerializedEntry);

    const app = buildTestApp();
    const res = await app.inject({
      method: 'GET',
      url: `/${entryId}`,
    });

    expect(res.statusCode).toBe(200);
    expect(getSportEntryImpl).toHaveBeenCalledWith(USER_ID_STR, entryId);
  });

  it('PATCH /:id updates a sport entry', async () => {
    updateSportEntryImpl.mockResolvedValue({
      ...mockSerializedEntry,
      itemName: 'Updated Shoes',
    });

    const app = buildTestApp();
    const res = await app.inject({
      method: 'PATCH',
      url: `/${entryId}`,
      payload: {
        itemName: 'Updated Shoes',
      },
    });

    expect(res.statusCode).toBe(200);
    expect(updateSportEntryImpl).toHaveBeenCalledWith(
      USER_ID_STR,
      entryId,
      expect.objectContaining({ itemName: 'Updated Shoes' }),
    );
  });

  it('DELETE /:id deletes a sport entry and returns 204', async () => {
    deleteSportEntryImpl.mockResolvedValue(undefined);

    const app = buildTestApp();
    const res = await app.inject({
      method: 'DELETE',
      url: `/${entryId}`,
    });

    expect(res.statusCode).toBe(204);
    expect(deleteSportEntryImpl).toHaveBeenCalledWith(USER_ID_STR, entryId);
  });
});
