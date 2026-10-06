import {
  VehicleFuelEntryEnrichedResponseDTO,
  VehicleFuelEntryResponseDTO,
} from '@vehicles/schema';
import * as vehicleServices from '@vehicles/services';
import Fastify from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { registerErrorHandler } from '@app/plugins/errorHandler';
import { USER_ID_STR } from '@testing/factories/general';
import {
  VehicleFuelEntryNotFoundError,
  VehicleNotFoundError,
  VehicleOdometerSequenceError,
} from '@utils/errors';

import { vehicleFuelRoutes } from './vehicle-fuel-routes';

const {
  createFuelEntryMock,
  getFuelEntriesMock,
  getFuelEntryMock,
  updateFuelEntryMock,
  deleteFuelEntryMock,
} = vi.hoisted(() => ({
  createFuelEntryMock: vi.fn(),
  getFuelEntriesMock: vi.fn(),
  getFuelEntryMock: vi.fn(),
  updateFuelEntryMock: vi.fn(),
  deleteFuelEntryMock: vi.fn(),
}));

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
    createFuelEntry: createFuelEntryMock,
    getFuelEntries: getFuelEntriesMock,
    getFuelEntry: getFuelEntryMock,
    updateFuelEntry: updateFuelEntryMock,
    deleteFuelEntry: deleteFuelEntryMock,
  };
});

describe('vehicle fuel routes', async () => {
  const app = Fastify().withTypeProvider<ZodTypeProvider>();
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.register(vehicleFuelRoutes);
  await registerErrorHandler(app);

  const vehicleId = '507f1f77bcf86cd799439012';
  const entryId = '507f1f77bcf86cd799439013';

  const mockFuelEntry: VehicleFuelEntryResponseDTO = {
    id: entryId,
    ownerId: USER_ID_STR,
    vehicleId,
    date: new Date('2026-01-10T00:00:00.000Z'),
    fuelLiters: 14.5,
    isFullTank: true,
    unitPricePln: 6.5,
    costPln: 94.25,
    odometerKm: 35000,
    stationBrand: 'Orlen',
    stationAddress: 'Warsaw, Main St 1',
    description: 'First refuel',
    transactionId: null,
    createdAt: new Date('2026-01-10T00:00:00.000Z'),
    updatedAt: new Date('2026-01-10T00:00:00.000Z'),
  };

  const mockEnrichedFuelEntry: VehicleFuelEntryEnrichedResponseDTO = {
    ...mockFuelEntry,
    distanceSincePreviousKm: 290,
    distanceSincePreviousFullKm: 290,
    fuelLitersToFull: 14.5,
    costToFullPln: 94.25,
    consumptionLPer100Km: 5.0,
    costPerKmPln: 0.325,
    kmPerLiter: 20.0,
  };

  const serializedMockFuelEntry = {
    ...mockFuelEntry,
    date: mockFuelEntry.date.toISOString(),
    createdAt: mockFuelEntry.createdAt.toISOString(),
    updatedAt: mockFuelEntry.updatedAt.toISOString(),
  };

  const serializedMockEnrichedFuelEntry = {
    ...mockEnrichedFuelEntry,
    date: mockEnrichedFuelEntry.date.toISOString(),
    createdAt: mockEnrichedFuelEntry.createdAt.toISOString(),
    updatedAt: mockEnrichedFuelEntry.updatedAt.toISOString(),
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /:vehicleId/fuel', () => {
    it('lists enriched fuel entries for a vehicle with 200 status', async () => {
      getFuelEntriesMock.mockResolvedValue([mockEnrichedFuelEntry]);

      const response = await app.inject({
        method: 'GET',
        url: `/${vehicleId}/fuel?page=1&limit=20&enriched=true`,
      });

      expect(vehicleServices.getFuelEntries).toHaveBeenCalledWith(
        USER_ID_STR,
        vehicleId,
        expect.objectContaining({
          page: 1,
          limit: 20,
          enriched: true,
        }),
      );
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual([serializedMockEnrichedFuelEntry]);
    });

    it('returns 404 when vehicle is not found for listing fuel entries', async () => {
      getFuelEntriesMock.mockRejectedValue(new VehicleNotFoundError('non-existent-id'));

      const response = await app.inject({
        method: 'GET',
        url: '/non-existent-id/fuel',
      });

      expect(response.statusCode).toBe(404);
      expect(response.json()).toMatchObject({
        code: 'VEHICLE_NOT_FOUND_ERROR',
      });
    });
  });

  describe('POST /:vehicleId/fuel', () => {
    const validFuelPayload = {
      date: '2026-01-10T00:00:00.000Z',
      fuelLiters: 14.5,
      isFullTank: true,
      unitPricePln: 6.5,
      costPln: 94.25,
      odometerKm: 35000,
      stationBrand: 'Orlen',
      stationAddress: 'Warsaw, Main St 1',
      description: 'First refuel',
    };

    it('creates a fuel entry successfully and returns 201', async () => {
      createFuelEntryMock.mockResolvedValue(mockFuelEntry);

      const response = await app.inject({
        method: 'POST',
        url: `/${vehicleId}/fuel`,
        body: validFuelPayload,
      });

      expect(vehicleServices.createFuelEntry).toHaveBeenCalledWith(
        USER_ID_STR,
        vehicleId,
        expect.objectContaining({
          fuelLiters: 14.5,
          unitPricePln: 6.5,
          costPln: 94.25,
          odometerKm: 35000,
        }),
      );
      expect(response.statusCode).toBe(201);
      expect(response.json()).toEqual(serializedMockFuelEntry);
    });

    it('returns 400 validation error when required fields are missing or invalid', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/${vehicleId}/fuel`,
        body: {
          fuelLiters: -5,
        },
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toMatchObject({
        code: 'VALIDATION_ERROR',
      });
      expect(vehicleServices.createFuelEntry).not.toHaveBeenCalled();
    });

    it('returns 400 when odometer sequence validation fails', async () => {
      createFuelEntryMock.mockRejectedValue(
        new VehicleOdometerSequenceError('too_low', 34000, 34500, new Date('2026-01-05')),
      );

      const response = await app.inject({
        method: 'POST',
        url: `/${vehicleId}/fuel`,
        body: validFuelPayload,
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toMatchObject({
        code: 'VEHICLE_ODOMETER_SEQUENCE_ERROR',
      });
    });

    it('returns 404 when vehicle is not found for creating fuel entry', async () => {
      createFuelEntryMock.mockRejectedValue(new VehicleNotFoundError('non-existent-id'));

      const response = await app.inject({
        method: 'POST',
        url: '/non-existent-id/fuel',
        body: validFuelPayload,
      });

      expect(response.statusCode).toBe(404);
      expect(response.json()).toMatchObject({
        code: 'VEHICLE_NOT_FOUND_ERROR',
      });
    });
  });

  describe('GET /:vehicleId/fuel/:entryId', () => {
    it('returns a single fuel entry with 200 status', async () => {
      getFuelEntryMock.mockResolvedValue(mockFuelEntry);

      const response = await app.inject({
        method: 'GET',
        url: `/${vehicleId}/fuel/${entryId}`,
      });

      expect(vehicleServices.getFuelEntry).toHaveBeenCalledWith(
        USER_ID_STR,
        vehicleId,
        entryId,
      );
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual(serializedMockFuelEntry);
    });

    it('returns 400 when entryId is not a valid ObjectId', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/${vehicleId}/fuel/invalid-entry-id`,
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toMatchObject({
        code: 'VALIDATION_ERROR',
      });
      expect(vehicleServices.getFuelEntry).not.toHaveBeenCalled();
    });

    it('returns 404 when fuel entry is not found', async () => {
      getFuelEntryMock.mockRejectedValue(new VehicleFuelEntryNotFoundError(entryId));

      const response = await app.inject({
        method: 'GET',
        url: `/${vehicleId}/fuel/${entryId}`,
      });

      expect(response.statusCode).toBe(404);
      expect(response.json()).toMatchObject({
        code: 'VEHICLE_FUEL_ENTRY_NOT_FOUND_ERROR',
      });
    });
  });

  describe('PATCH /:vehicleId/fuel/:entryId', () => {
    it('updates fuel entry details and returns 200', async () => {
      const updatedFuelEntry = { ...mockFuelEntry, fuelLiters: 15.0, costPln: 97.5 };
      updateFuelEntryMock.mockResolvedValue(updatedFuelEntry);

      const response = await app.inject({
        method: 'PATCH',
        url: `/${vehicleId}/fuel/${entryId}`,
        body: {
          fuelLiters: 15.0,
          costPln: 97.5,
        },
      });

      expect(vehicleServices.updateFuelEntry).toHaveBeenCalledWith(
        USER_ID_STR,
        vehicleId,
        entryId,
        expect.objectContaining({
          fuelLiters: 15.0,
          costPln: 97.5,
        }),
      );
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({
        ...serializedMockFuelEntry,
        fuelLiters: 15.0,
        costPln: 97.5,
      });
    });

    it('returns 400 when update payload has invalid values', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: `/${vehicleId}/fuel/${entryId}`,
        body: {
          fuelLiters: -10,
        },
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toMatchObject({
        code: 'VALIDATION_ERROR',
      });
      expect(vehicleServices.updateFuelEntry).not.toHaveBeenCalled();
    });

    it('returns 400 when odometer update breaks chronological sequence', async () => {
      updateFuelEntryMock.mockRejectedValue(
        new VehicleOdometerSequenceError(
          'too_high',
          40000,
          36000,
          new Date('2026-01-15'),
        ),
      );

      const response = await app.inject({
        method: 'PATCH',
        url: `/${vehicleId}/fuel/${entryId}`,
        body: {
          odometerKm: 40000,
        },
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toMatchObject({
        code: 'VEHICLE_ODOMETER_SEQUENCE_ERROR',
      });
    });

    it('returns 404 when fuel entry to update is not found', async () => {
      updateFuelEntryMock.mockRejectedValue(new VehicleFuelEntryNotFoundError(entryId));

      const response = await app.inject({
        method: 'PATCH',
        url: `/${vehicleId}/fuel/${entryId}`,
        body: {
          stationBrand: 'BP',
        },
      });

      expect(response.statusCode).toBe(404);
      expect(response.json()).toMatchObject({
        code: 'VEHICLE_FUEL_ENTRY_NOT_FOUND_ERROR',
      });
    });
  });

  describe('DELETE /:vehicleId/fuel/:entryId', () => {
    it('deletes fuel entry and returns 204 No Content', async () => {
      deleteFuelEntryMock.mockResolvedValue(undefined);

      const response = await app.inject({
        method: 'DELETE',
        url: `/${vehicleId}/fuel/${entryId}`,
      });

      expect(vehicleServices.deleteFuelEntry).toHaveBeenCalledWith(
        USER_ID_STR,
        vehicleId,
        entryId,
      );
      expect(response.statusCode).toBe(204);
      expect(response.body).toBe('');
    });

    it('returns 404 when fuel entry to delete is not found', async () => {
      deleteFuelEntryMock.mockRejectedValue(new VehicleFuelEntryNotFoundError(entryId));

      const response = await app.inject({
        method: 'DELETE',
        url: `/${vehicleId}/fuel/${entryId}`,
      });

      expect(response.statusCode).toBe(404);
      expect(response.json()).toMatchObject({
        code: 'VEHICLE_FUEL_ENTRY_NOT_FOUND_ERROR',
      });
    });
  });
});
