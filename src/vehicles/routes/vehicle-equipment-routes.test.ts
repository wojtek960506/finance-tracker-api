import {
  VehicleEquipmentCreateDTO,
  VehicleEquipmentResponseDTO,
  VehicleEquipmentUpdateDTO,
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
import { VehicleEquipmentNotFoundError, VehicleNotFoundError } from '@utils/errors';

import { vehicleEquipmentRoutes } from './vehicle-equipment-routes';

const {
  createEquipmentMock,
  getEquipmentListMock,
  getEquipmentMock,
  updateEquipmentMock,
  deleteEquipmentMock,
} = vi.hoisted(() => ({
  createEquipmentMock: vi.fn(),
  getEquipmentListMock: vi.fn(),
  getEquipmentMock: vi.fn(),
  updateEquipmentMock: vi.fn(),
  deleteEquipmentMock: vi.fn(),
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
    createEquipment: createEquipmentMock,
    getEquipmentList: getEquipmentListMock,
    getEquipment: getEquipmentMock,
    updateEquipment: updateEquipmentMock,
    deleteEquipment: deleteEquipmentMock,
  };
});

describe('vehicle equipment routes', async () => {
  const app = Fastify().withTypeProvider<ZodTypeProvider>();
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.register(vehicleEquipmentRoutes);
  await registerErrorHandler(app);

  const vehicleId = '507f1f77bcf86cd799439012';
  const itemId = '507f1f77bcf86cd799439013';

  const mockEquipmentItem: VehicleEquipmentResponseDTO = {
    id: itemId,
    ownerId: USER_ID_STR,
    vehicleId,
    date: new Date('2026-02-01T00:00:00.000Z'),
    itemName: 'Winter Tires Set',
    costPln: 2400,
    description: 'Michelin Alpin 6',
    transactionId: null,
    createdAt: new Date('2026-02-01T00:00:00.000Z'),
    updatedAt: new Date('2026-02-01T00:00:00.000Z'),
  };

  const serializedMockEquipment = {
    ...mockEquipmentItem,
    date: mockEquipmentItem.date.toISOString(),
    createdAt: mockEquipmentItem.createdAt.toISOString(),
    updatedAt: mockEquipmentItem.updatedAt.toISOString(),
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /:vehicleId/equipment', () => {
    it('should return 200 with list of equipment items', async () => {
      getEquipmentListMock.mockResolvedValue([mockEquipmentItem]);

      const res = await app.inject({
        method: 'GET',
        url: `/${vehicleId}/equipment`,
      });

      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual([serializedMockEquipment]);
      expect(getEquipmentListMock).toHaveBeenCalledWith(
        USER_ID_STR,
        vehicleId,
        expect.objectContaining({ page: 1, limit: 50 }),
      );
    });

    it('should pass query parameters to getEquipmentList service', async () => {
      getEquipmentListMock.mockResolvedValue([]);

      const res = await app.inject({
        method: 'GET',
        url: `/${vehicleId}/equipment?startDate=2026-01-01&endDate=2026-12-31&page=2&limit=10`,
      });

      expect(res.statusCode).toBe(200);
      expect(getEquipmentListMock).toHaveBeenCalledWith(
        USER_ID_STR,
        vehicleId,
        expect.objectContaining({
          startDate: new Date('2026-01-01T00:00:00.000Z'),
          endDate: new Date('2026-12-31T00:00:00.000Z'),
          page: 2,
          limit: 10,
        }),
      );
    });

    it('should return 404 when vehicle is not found', async () => {
      getEquipmentListMock.mockRejectedValue(new VehicleNotFoundError(vehicleId));

      const res = await app.inject({
        method: 'GET',
        url: `/${vehicleId}/equipment`,
      });

      expect(res.statusCode).toBe(404);
      expect(res.json()).toMatchObject({
        code: 'VEHICLE_NOT_FOUND_ERROR',
      });
    });
  });

  describe('POST /:vehicleId/equipment', () => {
    const validPayload: VehicleEquipmentCreateDTO = {
      date: new Date('2026-02-01T00:00:00.000Z'),
      itemName: 'Winter Tires Set',
      costPln: 2400,
      description: 'Michelin Alpin 6',
    };

    it('should return 201 with created equipment item', async () => {
      createEquipmentMock.mockResolvedValue(mockEquipmentItem);

      const res = await app.inject({
        method: 'POST',
        url: `/${vehicleId}/equipment`,
        payload: {
          ...validPayload,
          date: validPayload.date.toISOString(),
        },
      });

      expect(res.statusCode).toBe(201);
      expect(res.json()).toEqual(serializedMockEquipment);
      expect(createEquipmentMock).toHaveBeenCalledWith(
        USER_ID_STR,
        vehicleId,
        expect.objectContaining({
          itemName: 'Winter Tires Set',
          costPln: 2400,
        }),
      );
    });

    it('should return 400 when body validation fails', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/${vehicleId}/equipment`,
        payload: {
          itemName: '',
          costPln: -10,
        },
      });

      expect(res.statusCode).toBe(400);
      expect(res.json()).toMatchObject({
        code: 'VALIDATION_ERROR',
      });
      expect(createEquipmentMock).not.toHaveBeenCalled();
    });

    it('should return 404 when vehicle is not found', async () => {
      createEquipmentMock.mockRejectedValue(new VehicleNotFoundError(vehicleId));

      const res = await app.inject({
        method: 'POST',
        url: `/${vehicleId}/equipment`,
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

  describe('GET /:vehicleId/equipment/:itemId', () => {
    it('should return 200 with equipment item', async () => {
      getEquipmentMock.mockResolvedValue(mockEquipmentItem);

      const res = await app.inject({
        method: 'GET',
        url: `/${vehicleId}/equipment/${itemId}`,
      });

      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual(serializedMockEquipment);
      expect(getEquipmentMock).toHaveBeenCalledWith(USER_ID_STR, vehicleId, itemId);
    });

    it('should return 400 when itemId is invalid ObjectId format', async () => {
      const res = await app.inject({
        method: 'GET',
        url: `/${vehicleId}/equipment/invalid-id`,
      });

      expect(res.statusCode).toBe(400);
      expect(res.json()).toMatchObject({
        code: 'VALIDATION_ERROR',
      });
      expect(getEquipmentMock).not.toHaveBeenCalled();
    });

    it('should return 404 when equipment item is not found', async () => {
      getEquipmentMock.mockRejectedValue(new VehicleEquipmentNotFoundError(itemId));

      const res = await app.inject({
        method: 'GET',
        url: `/${vehicleId}/equipment/${itemId}`,
      });

      expect(res.statusCode).toBe(404);
      expect(res.json()).toMatchObject({
        code: 'VEHICLE_EQUIPMENT_NOT_FOUND_ERROR',
      });
    });

    it('should return 404 when vehicle is not found', async () => {
      getEquipmentMock.mockRejectedValue(new VehicleNotFoundError(vehicleId));

      const res = await app.inject({
        method: 'GET',
        url: `/${vehicleId}/equipment/${itemId}`,
      });

      expect(res.statusCode).toBe(404);
      expect(res.json()).toMatchObject({
        code: 'VEHICLE_NOT_FOUND_ERROR',
      });
    });
  });

  describe('PATCH /:vehicleId/equipment/:itemId', () => {
    const updatePayload: VehicleEquipmentUpdateDTO = {
      costPln: 2500,
      description: 'Updated description',
    };

    it('should return 200 with updated equipment item', async () => {
      const updatedEquipment = { ...mockEquipmentItem, costPln: 2500 };
      updateEquipmentMock.mockResolvedValue(updatedEquipment);

      const res = await app.inject({
        method: 'PATCH',
        url: `/${vehicleId}/equipment/${itemId}`,
        payload: updatePayload,
      });

      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual({
        ...serializedMockEquipment,
        costPln: 2500,
      });
      expect(updateEquipmentMock).toHaveBeenCalledWith(
        USER_ID_STR,
        vehicleId,
        itemId,
        updatePayload,
      );
    });

    it('should return 400 on invalid itemId format', async () => {
      const res = await app.inject({
        method: 'PATCH',
        url: `/${vehicleId}/equipment/invalid-id`,
        payload: updatePayload,
      });

      expect(res.statusCode).toBe(400);
      expect(res.json()).toMatchObject({
        code: 'VALIDATION_ERROR',
      });
      expect(updateEquipmentMock).not.toHaveBeenCalled();
    });

    it('should return 400 when body validation fails', async () => {
      const res = await app.inject({
        method: 'PATCH',
        url: `/${vehicleId}/equipment/${itemId}`,
        payload: {
          costPln: -50,
        },
      });

      expect(res.statusCode).toBe(400);
      expect(res.json()).toMatchObject({
        code: 'VALIDATION_ERROR',
      });
      expect(updateEquipmentMock).not.toHaveBeenCalled();
    });

    it('should return 404 when equipment item is not found', async () => {
      updateEquipmentMock.mockRejectedValue(new VehicleEquipmentNotFoundError(itemId));

      const res = await app.inject({
        method: 'PATCH',
        url: `/${vehicleId}/equipment/${itemId}`,
        payload: updatePayload,
      });

      expect(res.statusCode).toBe(404);
      expect(res.json()).toMatchObject({
        code: 'VEHICLE_EQUIPMENT_NOT_FOUND_ERROR',
      });
    });
  });

  describe('DELETE /:vehicleId/equipment/:itemId', () => {
    it('should return 204 on successful deletion', async () => {
      deleteEquipmentMock.mockResolvedValue(undefined);

      const res = await app.inject({
        method: 'DELETE',
        url: `/${vehicleId}/equipment/${itemId}`,
      });

      expect(res.statusCode).toBe(204);
      expect(res.body).toBe('');
      expect(deleteEquipmentMock).toHaveBeenCalledWith(USER_ID_STR, vehicleId, itemId);
    });

    it('should return 400 when itemId is invalid ObjectId format', async () => {
      const res = await app.inject({
        method: 'DELETE',
        url: `/${vehicleId}/equipment/invalid-id`,
      });

      expect(res.statusCode).toBe(400);
      expect(res.json()).toMatchObject({
        code: 'VALIDATION_ERROR',
      });
      expect(deleteEquipmentMock).not.toHaveBeenCalled();
    });

    it('should return 404 when equipment item is not found', async () => {
      deleteEquipmentMock.mockRejectedValue(new VehicleEquipmentNotFoundError(itemId));

      const res = await app.inject({
        method: 'DELETE',
        url: `/${vehicleId}/equipment/${itemId}`,
      });

      expect(res.statusCode).toBe(404);
      expect(res.json()).toMatchObject({
        code: 'VEHICLE_EQUIPMENT_NOT_FOUND_ERROR',
      });
    });

    it('should return 404 when vehicle is not found', async () => {
      deleteEquipmentMock.mockRejectedValue(new VehicleNotFoundError(vehicleId));

      const res = await app.inject({
        method: 'DELETE',
        url: `/${vehicleId}/equipment/${itemId}`,
      });

      expect(res.statusCode).toBe(404);
      expect(res.json()).toMatchObject({
        code: 'VEHICLE_NOT_FOUND_ERROR',
      });
    });
  });
});
