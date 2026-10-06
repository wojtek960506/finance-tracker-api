import { VehicleResponseDTO } from '@vehicles/schema';
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
  VehicleDependencyError,
  VehicleNameAlreadyExistsError,
  VehicleNotFoundError,
  VehicleSlugAlreadyExistsError,
} from '@utils/errors';

import { vehicleRoutes } from './vehicle-routes';

const {
  createVehicleMock,
  getVehiclesMock,
  getVehicleMock,
  updateVehicleMock,
  deleteVehicleMock,
} = vi.hoisted(() => ({
  createVehicleMock: vi.fn(),
  getVehiclesMock: vi.fn(),
  getVehicleMock: vi.fn(),
  updateVehicleMock: vi.fn(),
  deleteVehicleMock: vi.fn(),
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
    createVehicle: createVehicleMock,
    getVehicles: getVehiclesMock,
    getVehicle: getVehicleMock,
    updateVehicle: updateVehicleMock,
    deleteVehicle: deleteVehicleMock,
  };
});

describe('vehicle routes', async () => {
  const app = Fastify().withTypeProvider<ZodTypeProvider>();
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.register(vehicleRoutes);
  await registerErrorHandler(app);

  const vehicleId = '507f1f77bcf86cd799439012';

  const mockVehicle: VehicleResponseDTO = {
    id: vehicleId,
    ownerId: USER_ID_STR,
    slug: 'suzuki-sv-650',
    name: 'Suzuki SV650',
    brand: 'Suzuki',
    vehicleModel: 'SV650',
    type: 'motorcycle',
    productionYear: 2007,
    notes: 'Great commuter motorcycle',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-02T00:00:00.000Z'),
  };

  const serializedMockVehicle = {
    ...mockVehicle,
    createdAt: mockVehicle.createdAt.toISOString(),
    updatedAt: mockVehicle.updatedAt.toISOString(),
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /', () => {
    it('creates a vehicle successfully and returns 201', async () => {
      createVehicleMock.mockResolvedValue(mockVehicle);

      const response = await app.inject({
        method: 'POST',
        url: '/',
        body: {
          name: 'Suzuki SV650',
          brand: 'Suzuki',
          vehicleModel: 'SV650',
          type: 'motorcycle',
          productionYear: 2007,
          notes: 'Great commuter motorcycle',
        },
      });

      expect(vehicleServices.createVehicle).toHaveBeenCalledWith(USER_ID_STR, {
        name: 'Suzuki SV650',
        brand: 'Suzuki',
        vehicleModel: 'SV650',
        type: 'motorcycle',
        productionYear: 2007,
        notes: 'Great commuter motorcycle',
      });
      expect(response.statusCode).toBe(201);
      expect(response.json()).toEqual(serializedMockVehicle);
    });

    it('returns 400 validation error when required fields are missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/',
        body: {
          brand: 'Suzuki',
        },
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toMatchObject({
        code: 'VALIDATION_ERROR',
      });
      expect(vehicleServices.createVehicle).not.toHaveBeenCalled();
    });

    it('returns 409 conflict when vehicle name already exists', async () => {
      createVehicleMock.mockRejectedValue(
        new VehicleNameAlreadyExistsError('Suzuki SV650'),
      );

      const response = await app.inject({
        method: 'POST',
        url: '/',
        body: {
          name: 'Suzuki SV650',
          type: 'motorcycle',
        },
      });

      expect(response.statusCode).toBe(409);
      expect(response.json()).toMatchObject({
        code: 'VEHICLE_NAME_ALREADY_EXISTS_ERROR',
      });
    });

    it('returns 409 conflict when vehicle slug already exists', async () => {
      createVehicleMock.mockRejectedValue(
        new VehicleSlugAlreadyExistsError('suzuki-sv-650'),
      );

      const response = await app.inject({
        method: 'POST',
        url: '/',
        body: {
          name: 'Suzuki SV 650',
          slug: 'suzuki-sv-650',
          type: 'motorcycle',
        },
      });

      expect(response.statusCode).toBe(409);
      expect(response.json()).toMatchObject({
        code: 'VEHICLE_SLUG_ALREADY_EXISTS_ERROR',
      });
    });
  });

  describe('GET /', () => {
    it('lists all user vehicles with 200 status', async () => {
      getVehiclesMock.mockResolvedValue([mockVehicle]);

      const response = await app.inject({
        method: 'GET',
        url: '/',
      });

      expect(vehicleServices.getVehicles).toHaveBeenCalledWith(USER_ID_STR);
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual([serializedMockVehicle]);
    });
  });

  describe('GET /:vehicleId', () => {
    it('returns vehicle by ID or slug with 200 status', async () => {
      getVehicleMock.mockResolvedValue(mockVehicle);

      const response = await app.inject({
        method: 'GET',
        url: `/${vehicleId}`,
      });

      expect(vehicleServices.getVehicle).toHaveBeenCalledWith(USER_ID_STR, vehicleId);
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual(serializedMockVehicle);
    });

    it('returns 404 when vehicle is not found', async () => {
      getVehicleMock.mockRejectedValue(new VehicleNotFoundError('non-existent-id'));

      const response = await app.inject({
        method: 'GET',
        url: '/non-existent-id',
      });

      expect(response.statusCode).toBe(404);
      expect(response.json()).toMatchObject({
        code: 'VEHICLE_NOT_FOUND_ERROR',
      });
    });
  });

  describe('PATCH /:vehicleId', () => {
    it('updates vehicle details and returns 200', async () => {
      const updatedVehicle = { ...mockVehicle, name: 'Suzuki SV650S' };
      updateVehicleMock.mockResolvedValue(updatedVehicle);

      const response = await app.inject({
        method: 'PATCH',
        url: `/${vehicleId}`,
        body: {
          name: 'Suzuki SV650S',
        },
      });

      expect(vehicleServices.updateVehicle).toHaveBeenCalledWith(USER_ID_STR, vehicleId, {
        name: 'Suzuki SV650S',
      });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({
        ...serializedMockVehicle,
        name: 'Suzuki SV650S',
      });
    });

    it('returns 400 when updating with invalid data', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: `/${vehicleId}`,
        body: {
          type: 'invalid-type-value',
        },
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toMatchObject({
        code: 'VALIDATION_ERROR',
      });
      expect(vehicleServices.updateVehicle).not.toHaveBeenCalled();
    });

    it('returns 404 when updating a non-existent vehicle', async () => {
      updateVehicleMock.mockRejectedValue(new VehicleNotFoundError('non-existent-id'));

      const response = await app.inject({
        method: 'PATCH',
        url: '/non-existent-id',
        body: {
          name: 'New Name',
        },
      });

      expect(response.statusCode).toBe(404);
      expect(response.json()).toMatchObject({
        code: 'VEHICLE_NOT_FOUND_ERROR',
      });
    });

    it('returns 409 when updated name already exists', async () => {
      updateVehicleMock.mockRejectedValue(
        new VehicleNameAlreadyExistsError('Existing Vehicle'),
      );

      const response = await app.inject({
        method: 'PATCH',
        url: `/${vehicleId}`,
        body: {
          name: 'Existing Vehicle',
        },
      });

      expect(response.statusCode).toBe(409);
      expect(response.json()).toMatchObject({
        code: 'VEHICLE_NAME_ALREADY_EXISTS_ERROR',
      });
    });
  });

  describe('DELETE /:vehicleId', () => {
    it('deletes vehicle and returns 204 No Content', async () => {
      deleteVehicleMock.mockResolvedValue(undefined);

      const response = await app.inject({
        method: 'DELETE',
        url: `/${vehicleId}`,
      });

      expect(vehicleServices.deleteVehicle).toHaveBeenCalledWith(USER_ID_STR, vehicleId);
      expect(response.statusCode).toBe(204);
      expect(response.body).toBe('');
    });

    it('returns 403 Forbidden when vehicle has dependencies', async () => {
      deleteVehicleMock.mockRejectedValue(new VehicleDependencyError(vehicleId));

      const response = await app.inject({
        method: 'DELETE',
        url: `/${vehicleId}`,
      });

      expect(response.statusCode).toBe(403);
      expect(response.json()).toMatchObject({
        code: 'VEHICLE_DEPENDENCY_ERROR',
      });
    });

    it('returns 404 Not Found when deleting non-existent vehicle', async () => {
      deleteVehicleMock.mockRejectedValue(new VehicleNotFoundError('non-existent-id'));

      const response = await app.inject({
        method: 'DELETE',
        url: '/non-existent-id',
      });

      expect(response.statusCode).toBe(404);
      expect(response.json()).toMatchObject({
        code: 'VEHICLE_NOT_FOUND_ERROR',
      });
    });
  });
});
