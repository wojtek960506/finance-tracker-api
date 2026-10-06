import {
  VehicleCreateDTO,
  VehicleCreateSchema,
  VehicleListResponseDTO,
  VehicleListResponseSchema,
  VehicleParamsDTO,
  VehicleParamsSchema,
  VehicleResponseDTO,
  VehicleResponseSchema,
  VehicleUpdateDTO,
  VehicleUpdateSchema,
} from '@vehicles/schema';
import { FastifyInstance } from 'fastify';
import { z } from 'zod/v4';

import { authorizeAccessToken } from '@auth/services';
import { validateBody } from '@utils/validation';

import {
  createVehicleHandler,
  deleteVehicleHandler,
  getVehicleHandler,
  getVehiclesHandler,
  updateVehicleHandler,
} from './handlers';
import { vehicleEquipmentRoutes } from './vehicle-equipment-routes';
import { vehicleFuelRoutes } from './vehicle-fuel-routes';

export async function vehicleRoutes(
  app: FastifyInstance & { withTypeProvider: <_T>() => any },
) {
  // --- Core Vehicles Endpoints ---

  app.get<{ Reply: VehicleListResponseDTO }>(
    '/',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Vehicles'],
        summary: 'List vehicles',
        description: 'Return all vehicles for the authenticated user.',
        response: {
          200: VehicleListResponseSchema,
        },
      },
    },
    getVehiclesHandler,
  );

  app.post<{ Body: VehicleCreateDTO; Reply: VehicleResponseDTO }>(
    '/',
    {
      preHandler: [validateBody(VehicleCreateSchema), authorizeAccessToken()],
      schema: {
        tags: ['Vehicles'],
        summary: 'Create vehicle',
        description: 'Create a new vehicle for the authenticated user.',
        body: VehicleCreateSchema,
        response: {
          201: VehicleResponseSchema,
        },
      },
    },
    createVehicleHandler,
  );

  app.get<{ Params: VehicleParamsDTO; Reply: VehicleResponseDTO }>(
    '/:vehicleId',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Vehicles'],
        summary: 'Get vehicle by id or slug',
        description: 'Return a single vehicle by MongoDB ObjectId or slug.',
        params: VehicleParamsSchema,
        response: {
          200: VehicleResponseSchema,
        },
      },
    },
    getVehicleHandler,
  );

  app.patch<{
    Params: VehicleParamsDTO;
    Body: VehicleUpdateDTO;
    Reply: VehicleResponseDTO;
  }>(
    '/:vehicleId',
    {
      preHandler: [validateBody(VehicleUpdateSchema), authorizeAccessToken()],
      schema: {
        tags: ['Vehicles'],
        summary: 'Update vehicle',
        description: 'Update a vehicle by id or slug.',
        params: VehicleParamsSchema,
        body: VehicleUpdateSchema,
        response: {
          200: VehicleResponseSchema,
        },
      },
    },
    updateVehicleHandler,
  );

  app.delete<{ Params: VehicleParamsDTO; Reply: void }>(
    '/:vehicleId',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Vehicles'],
        summary: 'Delete vehicle',
        description:
          'Delete a vehicle by id or slug (only allowed if it has no associated records).',
        params: VehicleParamsSchema,
        response: {
          204: z.undefined(),
        },
      },
    },
    deleteVehicleHandler,
  );

  // --- Sub-domain Route Plugins ---
  app.register(vehicleFuelRoutes);
  app.register(vehicleEquipmentRoutes);
}
