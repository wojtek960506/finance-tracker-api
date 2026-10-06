import {
  VehicleMaintenanceCreateDTO,
  VehicleMaintenanceResponseDTO,
  VehicleMaintenanceUpdateDTO,
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
import { VehicleMaintenanceNotFoundError, VehicleNotFoundError } from '@utils/errors';

import { vehicleMaintenanceRoutes } from './vehicle-maintenance-routes';

const {
  createMaintenanceMock,
  getMaintenanceListMock,
  getMaintenanceMock,
  updateMaintenanceMock,
  deleteMaintenanceMock,
} = vi.hoisted(() => ({
  createMaintenanceMock: vi.fn(),
  getMaintenanceListMock: vi.fn(),
  getMaintenanceMock: vi.fn(),
  updateMaintenanceMock: vi.fn(),
  deleteMaintenanceMock: vi.fn(),
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
    createMaintenance: createMaintenanceMock,
    getMaintenanceList: getMaintenanceListMock,
    getMaintenance: getMaintenanceMock,
    updateMaintenance: updateMaintenanceMock,
    deleteMaintenance: deleteMaintenanceMock,
  };
});

describe('vehicle maintenance routes', async () => {
  const app = Fastify().withTypeProvider<ZodTypeProvider>();
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.register(vehicleMaintenanceRoutes);
  await registerErrorHandler(app);

  const vehicleId = '507f1f77bcf86cd799439012';
  const recordId = '507f1f77bcf86cd799439013';

  const mockMaintenanceRecord: VehicleMaintenanceResponseDTO = {
    id: recordId,
    ownerId: USER_ID_STR,
    vehicleId,
    section: 'own_maintenance',
    date: new Date('2026-03-01T00:00:00.000Z'),
    costPln: 850,
    odometerKm: 36000,
    description: 'Oil and filter change',
    serviceProvider: 'AutoService Warsaw',
    transactionId: null,
    createdAt: new Date('2026-03-01T00:00:00.000Z'),
    updatedAt: new Date('2026-03-01T00:00:00.000Z'),
  };

  const serializedMockMaintenance = {
    ...mockMaintenanceRecord,
    date: mockMaintenanceRecord.date.toISOString(),
    createdAt: mockMaintenanceRecord.createdAt.toISOString(),
    updatedAt: mockMaintenanceRecord.updatedAt.toISOString(),
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /:vehicleId/maintenance', () => {
    it('should return 200 with list of maintenance records', async () => {
      getMaintenanceListMock.mockResolvedValue([mockMaintenanceRecord]);

      const res = await app.inject({
        method: 'GET',
        url: `/${vehicleId}/maintenance`,
      });

      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual([serializedMockMaintenance]);
      expect(getMaintenanceListMock).toHaveBeenCalledWith(
        USER_ID_STR,
        vehicleId,
        expect.objectContaining({ page: 1, limit: 50 }),
      );
    });

    it('should pass query parameters to getMaintenanceList service', async () => {
      getMaintenanceListMock.mockResolvedValue([]);

      const res = await app.inject({
        method: 'GET',
        url:
          `/${vehicleId}/maintenance?section=own_maintenance` +
          '&startDate=2026-01-01&endDate=2026-12-31&page=2&limit=10',
      });

      expect(res.statusCode).toBe(200);
      expect(getMaintenanceListMock).toHaveBeenCalledWith(
        USER_ID_STR,
        vehicleId,
        expect.objectContaining({
          section: 'own_maintenance',
          startDate: new Date('2026-01-01T00:00:00.000Z'),
          endDate: new Date('2026-12-31T00:00:00.000Z'),
          page: 2,
          limit: 10,
        }),
      );
    });

    it('should return 404 when vehicle is not found', async () => {
      getMaintenanceListMock.mockRejectedValue(new VehicleNotFoundError(vehicleId));

      const res = await app.inject({
        method: 'GET',
        url: `/${vehicleId}/maintenance`,
      });

      expect(res.statusCode).toBe(404);
      expect(res.json()).toMatchObject({
        code: 'VEHICLE_NOT_FOUND_ERROR',
      });
    });
  });

  describe('POST /:vehicleId/maintenance', () => {
    const validPayload: VehicleMaintenanceCreateDTO = {
      section: 'own_maintenance',
      date: new Date('2026-03-01T00:00:00.000Z'),
      costPln: 850,
      odometerKm: 36000,
      description: 'Oil and filter change',
      serviceProvider: 'AutoService Warsaw',
    };

    it('should return 201 with created maintenance record', async () => {
      createMaintenanceMock.mockResolvedValue(mockMaintenanceRecord);

      const res = await app.inject({
        method: 'POST',
        url: `/${vehicleId}/maintenance`,
        payload: {
          ...validPayload,
          date: validPayload.date.toISOString(),
        },
      });

      expect(res.statusCode).toBe(201);
      expect(res.json()).toEqual(serializedMockMaintenance);
      expect(createMaintenanceMock).toHaveBeenCalledWith(
        USER_ID_STR,
        vehicleId,
        expect.objectContaining({
          section: 'own_maintenance',
          costPln: 850,
          odometerKm: 36000,
        }),
      );
    });

    it('should return 400 when body validation fails', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/${vehicleId}/maintenance`,
        payload: {
          section: 'invalid_section',
          costPln: -10,
        },
      });

      expect(res.statusCode).toBe(400);
      expect(res.json()).toMatchObject({
        code: 'VALIDATION_ERROR',
      });
      expect(createMaintenanceMock).not.toHaveBeenCalled();
    });

    it('should return 404 when vehicle is not found', async () => {
      createMaintenanceMock.mockRejectedValue(new VehicleNotFoundError(vehicleId));

      const res = await app.inject({
        method: 'POST',
        url: `/${vehicleId}/maintenance`,
        payload: {
          ...validPayload,
          date: validPayload.date.toISOString(),
        },
      });

      expect(res.statusCode).toBe(404);
      expect(res.json()).toMatchObject({
        code: 'VEHICLE_NOT_FOUND_ERROR',
      });
    });
  });

  describe('GET /:vehicleId/maintenance/:recordId', () => {
    it('should return 200 with maintenance record', async () => {
      getMaintenanceMock.mockResolvedValue(mockMaintenanceRecord);

      const res = await app.inject({
        method: 'GET',
        url: `/${vehicleId}/maintenance/${recordId}`,
      });

      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual(serializedMockMaintenance);
      expect(getMaintenanceMock).toHaveBeenCalledWith(USER_ID_STR, vehicleId, recordId);
    });

    it('should return 400 when recordId is invalid ObjectId format', async () => {
      const res = await app.inject({
        method: 'GET',
        url: `/${vehicleId}/maintenance/invalid-id`,
      });

      expect(res.statusCode).toBe(400);
      expect(res.json()).toMatchObject({
        code: 'VALIDATION_ERROR',
      });
      expect(getMaintenanceMock).not.toHaveBeenCalled();
    });

    it('should return 404 when maintenance record is not found', async () => {
      getMaintenanceMock.mockRejectedValue(new VehicleMaintenanceNotFoundError(recordId));

      const res = await app.inject({
        method: 'GET',
        url: `/${vehicleId}/maintenance/${recordId}`,
      });

      expect(res.statusCode).toBe(404);
      expect(res.json()).toMatchObject({
        code: 'VEHICLE_MAINTENANCE_NOT_FOUND_ERROR',
      });
    });

    it('should return 404 when vehicle is not found', async () => {
      getMaintenanceMock.mockRejectedValue(new VehicleNotFoundError(vehicleId));

      const res = await app.inject({
        method: 'GET',
        url: `/${vehicleId}/maintenance/${recordId}`,
      });

      expect(res.statusCode).toBe(404);
      expect(res.json()).toMatchObject({
        code: 'VEHICLE_NOT_FOUND_ERROR',
      });
    });
  });

  describe('PATCH /:vehicleId/maintenance/:recordId', () => {
    const updatePayload: VehicleMaintenanceUpdateDTO = {
      costPln: 900,
      description: 'Updated description',
    };

    it('should return 200 with updated maintenance record', async () => {
      const updatedMaintenance = { ...mockMaintenanceRecord, costPln: 900 };
      updateMaintenanceMock.mockResolvedValue(updatedMaintenance);

      const res = await app.inject({
        method: 'PATCH',
        url: `/${vehicleId}/maintenance/${recordId}`,
        payload: updatePayload,
      });

      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual({
        ...serializedMockMaintenance,
        costPln: 900,
      });
      expect(updateMaintenanceMock).toHaveBeenCalledWith(
        USER_ID_STR,
        vehicleId,
        recordId,
        updatePayload,
      );
    });

    it('should return 400 on invalid recordId format', async () => {
      const res = await app.inject({
        method: 'PATCH',
        url: `/${vehicleId}/maintenance/invalid-id`,
        payload: updatePayload,
      });

      expect(res.statusCode).toBe(400);
      expect(res.json()).toMatchObject({
        code: 'VALIDATION_ERROR',
      });
      expect(updateMaintenanceMock).not.toHaveBeenCalled();
    });

    it('should return 400 when body validation fails', async () => {
      const res = await app.inject({
        method: 'PATCH',
        url: `/${vehicleId}/maintenance/${recordId}`,
        payload: {
          costPln: -50,
        },
      });

      expect(res.statusCode).toBe(400);
      expect(res.json()).toMatchObject({
        code: 'VALIDATION_ERROR',
      });
      expect(updateMaintenanceMock).not.toHaveBeenCalled();
    });

    it('should return 404 when maintenance record is not found', async () => {
      updateMaintenanceMock.mockRejectedValue(
        new VehicleMaintenanceNotFoundError(recordId),
      );

      const res = await app.inject({
        method: 'PATCH',
        url: `/${vehicleId}/maintenance/${recordId}`,
        payload: updatePayload,
      });

      expect(res.statusCode).toBe(404);
      expect(res.json()).toMatchObject({
        code: 'VEHICLE_MAINTENANCE_NOT_FOUND_ERROR',
      });
    });
  });

  describe('DELETE /:vehicleId/maintenance/:recordId', () => {
    it('should return 204 on successful deletion', async () => {
      deleteMaintenanceMock.mockResolvedValue(undefined);

      const res = await app.inject({
        method: 'DELETE',
        url: `/${vehicleId}/maintenance/${recordId}`,
      });

      expect(res.statusCode).toBe(204);
      expect(res.body).toBe('');
      expect(deleteMaintenanceMock).toHaveBeenCalledWith(
        USER_ID_STR,
        vehicleId,
        recordId,
      );
    });

    it('should return 400 when recordId is invalid ObjectId format', async () => {
      const res = await app.inject({
        method: 'DELETE',
        url: `/${vehicleId}/maintenance/invalid-id`,
      });

      expect(res.statusCode).toBe(400);
      expect(res.json()).toMatchObject({
        code: 'VALIDATION_ERROR',
      });
      expect(deleteMaintenanceMock).not.toHaveBeenCalled();
    });

    it('should return 404 when maintenance record is not found', async () => {
      deleteMaintenanceMock.mockRejectedValue(
        new VehicleMaintenanceNotFoundError(recordId),
      );

      const res = await app.inject({
        method: 'DELETE',
        url: `/${vehicleId}/maintenance/${recordId}`,
      });

      expect(res.statusCode).toBe(404);
      expect(res.json()).toMatchObject({
        code: 'VEHICLE_MAINTENANCE_NOT_FOUND_ERROR',
      });
    });

    it('should return 404 when vehicle is not found', async () => {
      deleteMaintenanceMock.mockRejectedValue(new VehicleNotFoundError(vehicleId));

      const res = await app.inject({
        method: 'DELETE',
        url: `/${vehicleId}/maintenance/${recordId}`,
      });

      expect(res.statusCode).toBe(404);
      expect(res.json()).toMatchObject({
        code: 'VEHICLE_NOT_FOUND_ERROR',
      });
    });
  });
});
