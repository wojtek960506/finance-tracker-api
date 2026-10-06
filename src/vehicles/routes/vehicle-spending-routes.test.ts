import {
  LinkSpendingsToTransactionDTO,
  SpendingLinkResponseDTO,
  UnlinkSpendingFromTransactionDTO,
} from '@vehicles/schema';
import Fastify from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { registerErrorHandler } from '@app/plugins/errorHandler';
import { USER_ID_STR } from '@testing/factories/general';
import { TransactionNotFoundError, VehicleSpendingNotFoundError } from '@utils/errors';

import { vehicleSpendingRoutes } from './vehicle-spending-routes';

const { linkSpendingsToTransactionMock, unlinkSpendingFromTransactionMock } = vi.hoisted(
  () => ({
    linkSpendingsToTransactionMock: vi.fn(),
    unlinkSpendingFromTransactionMock: vi.fn(),
  }),
);

const mockPreHandler = vi.fn(async (req, _res) => {
  (req as any).userId = USER_ID_STR;
});

vi.mock('@auth/services', () => ({
  authorizeAccessToken: vi.fn(() => mockPreHandler),
}));

vi.mock('@vehicles/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@vehicles/services')>();
  return {
    ...actual,
    linkSpendingsToTransaction: linkSpendingsToTransactionMock,
    unlinkSpendingFromTransaction: unlinkSpendingFromTransactionMock,
  };
});

describe('vehicle spending routes', async () => {
  const app = Fastify().withTypeProvider<ZodTypeProvider>();
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.register(vehicleSpendingRoutes);
  await registerErrorHandler(app);

  const transactionId = '507f1f77bcf86cd799439011';
  const fuelSpendingId = '507f1f77bcf86cd799439012';
  const equipmentSpendingId = '507f1f77bcf86cd799439013';

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /spendings/link', () => {
    const validPayload: LinkSpendingsToTransactionDTO = {
      transactionId,
      spendings: [
        { spendingType: 'fuel', spendingId: fuelSpendingId },
        { spendingType: 'equipment', spendingId: equipmentSpendingId },
      ],
    };

    it('should return 200 with response when linking spendings', async () => {
      const mockResult: SpendingLinkResponseDTO = {
        acknowledged: true,
        modifiedCount: 2,
      };
      linkSpendingsToTransactionMock.mockResolvedValue(mockResult);

      const res = await app.inject({
        method: 'POST',
        url: '/spendings/link',
        payload: validPayload,
      });

      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual(mockResult);
      expect(linkSpendingsToTransactionMock).toHaveBeenCalledWith(
        USER_ID_STR,
        validPayload,
      );
    });

    it('should return 400 when transactionId is invalid ObjectId format', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/spendings/link',
        payload: {
          ...validPayload,
          transactionId: 'invalid-id',
        },
      });

      expect(res.statusCode).toBe(400);
      expect(res.json()).toMatchObject({
        code: 'VALIDATION_ERROR',
      });
      expect(linkSpendingsToTransactionMock).not.toHaveBeenCalled();
    });

    it('should return 400 when spendings list is empty', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/spendings/link',
        payload: {
          transactionId,
          spendings: [],
        },
      });

      expect(res.statusCode).toBe(400);
      expect(res.json()).toMatchObject({
        code: 'VALIDATION_ERROR',
      });
      expect(linkSpendingsToTransactionMock).not.toHaveBeenCalled();
    });

    it('should return 404 when transaction is not found', async () => {
      linkSpendingsToTransactionMock.mockRejectedValue(
        new TransactionNotFoundError(transactionId),
      );

      const res = await app.inject({
        method: 'POST',
        url: '/spendings/link',
        payload: validPayload,
      });

      expect(res.statusCode).toBe(404);
      expect(res.json()).toMatchObject({
        code: 'TRANSACTION_NOT_FOUND_ERROR',
      });
    });

    it('should return 404 when a spending item is not found', async () => {
      linkSpendingsToTransactionMock.mockRejectedValue(
        new VehicleSpendingNotFoundError('fuel', fuelSpendingId),
      );

      const res = await app.inject({
        method: 'POST',
        url: '/spendings/link',
        payload: validPayload,
      });

      expect(res.statusCode).toBe(404);
      expect(res.json()).toMatchObject({
        code: 'VEHICLE_SPENDING_NOT_FOUND_ERROR',
      });
    });
  });

  describe('POST /spendings/unlink', () => {
    const validPayload: UnlinkSpendingFromTransactionDTO = {
      spendingType: 'fuel',
      spendingId: fuelSpendingId,
    };

    it('should return 200 with response when unlinking spending', async () => {
      const mockResult: SpendingLinkResponseDTO = {
        acknowledged: true,
        modifiedCount: 1,
      };
      unlinkSpendingFromTransactionMock.mockResolvedValue(mockResult);

      const res = await app.inject({
        method: 'POST',
        url: '/spendings/unlink',
        payload: validPayload,
      });

      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual(mockResult);
      expect(unlinkSpendingFromTransactionMock).toHaveBeenCalledWith(
        USER_ID_STR,
        'fuel',
        fuelSpendingId,
      );
    });

    it('should return 400 when spendingId is invalid ObjectId format', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/spendings/unlink',
        payload: {
          spendingType: 'fuel',
          spendingId: 'invalid-id',
        },
      });

      expect(res.statusCode).toBe(400);
      expect(res.json()).toMatchObject({
        code: 'VALIDATION_ERROR',
      });
      expect(unlinkSpendingFromTransactionMock).not.toHaveBeenCalled();
    });

    it('should return 400 when spendingType is invalid', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/spendings/unlink',
        payload: {
          spendingType: 'unknown_type',
          spendingId: fuelSpendingId,
        },
      });

      expect(res.statusCode).toBe(400);
      expect(res.json()).toMatchObject({
        code: 'VALIDATION_ERROR',
      });
      expect(unlinkSpendingFromTransactionMock).not.toHaveBeenCalled();
    });

    it('should return 404 when spending item is not found', async () => {
      unlinkSpendingFromTransactionMock.mockRejectedValue(
        new VehicleSpendingNotFoundError('fuel', fuelSpendingId),
      );

      const res = await app.inject({
        method: 'POST',
        url: '/spendings/unlink',
        payload: validPayload,
      });

      expect(res.statusCode).toBe(404);
      expect(res.json()).toMatchObject({
        code: 'VEHICLE_SPENDING_NOT_FOUND_ERROR',
      });
    });
  });
});
