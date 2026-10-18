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

import { sportSpendingRoutes } from './sport-spending-routes';

const { linkSportSpendingsImpl, unlinkSportSpendingImpl } = vi.hoisted(() => ({
  linkSportSpendingsImpl: vi.fn(),
  unlinkSportSpendingImpl: vi.fn(),
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
    linkSportSpendingsToTransaction: linkSportSpendingsImpl,
    unlinkSportSpendingFromTransaction: unlinkSportSpendingImpl,
  };
});

const buildTestApp = () => {
  const app = Fastify({ logger: false }).withTypeProvider<ZodTypeProvider>();
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  registerErrorHandler(app);
  app.register(sportSpendingRoutes);
  return app;
};

describe('sportSpendingRoutes', () => {
  const transactionId = new Types.ObjectId().toString();
  const entryId1 = new Types.ObjectId().toString();
  const entryId2 = new Types.ObjectId().toString();

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /spendings/link', () => {
    it('returns 200 and link result on valid payload', async () => {
      const app = buildTestApp();
      linkSportSpendingsImpl.mockResolvedValueOnce({
        acknowledged: true,
        modifiedCount: 2,
      });

      const response = await app.inject({
        method: 'POST',
        url: '/spendings/link',
        payload: {
          transactionId,
          entryIds: [entryId1, entryId2],
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ acknowledged: true, modifiedCount: 2 });
      expect(linkSportSpendingsImpl).toHaveBeenCalledWith(USER_ID_STR, {
        transactionId,
        entryIds: [entryId1, entryId2],
      });
    });

    it('returns 400 when entryIds array is empty', async () => {
      const app = buildTestApp();

      const response = await app.inject({
        method: 'POST',
        url: '/spendings/link',
        payload: {
          transactionId,
          entryIds: [],
        },
      });

      expect(response.statusCode).toBe(400);
      expect(linkSportSpendingsImpl).not.toHaveBeenCalled();
    });

    it('returns 400 when transactionId is invalid ObjectId', async () => {
      const app = buildTestApp();

      const response = await app.inject({
        method: 'POST',
        url: '/spendings/link',
        payload: {
          transactionId: 'invalid-id',
          entryIds: [entryId1],
        },
      });

      expect(response.statusCode).toBe(400);
      expect(linkSportSpendingsImpl).not.toHaveBeenCalled();
    });
  });

  describe('POST /spendings/unlink', () => {
    it('returns 200 and unlink result on valid payload', async () => {
      const app = buildTestApp();
      unlinkSportSpendingImpl.mockResolvedValueOnce({
        acknowledged: true,
        modifiedCount: 1,
      });

      const response = await app.inject({
        method: 'POST',
        url: '/spendings/unlink',
        payload: {
          entryId: entryId1,
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ acknowledged: true, modifiedCount: 1 });
      expect(unlinkSportSpendingImpl).toHaveBeenCalledWith(USER_ID_STR, {
        entryId: entryId1,
      });
    });

    it('returns 400 when entryId is invalid ObjectId', async () => {
      const app = buildTestApp();

      const response = await app.inject({
        method: 'POST',
        url: '/spendings/unlink',
        payload: {
          entryId: 'invalid-id',
        },
      });

      expect(response.statusCode).toBe(400);
      expect(unlinkSportSpendingImpl).not.toHaveBeenCalled();
    });
  });
});
