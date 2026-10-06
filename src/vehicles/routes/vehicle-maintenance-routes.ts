import {
  VehicleMaintenanceCreateDTO,
  VehicleMaintenanceCreateSchema,
  VehicleMaintenanceFilterQuery,
  VehicleMaintenanceFilterQuerySchema,
  VehicleMaintenanceListResponseDTO,
  VehicleMaintenanceListResponseSchema,
  VehicleMaintenanceParamsDTO,
  VehicleMaintenanceParamsSchema,
  VehicleMaintenanceResponseDTO,
  VehicleMaintenanceResponseSchema,
  VehicleMaintenanceUpdateDTO,
  VehicleMaintenanceUpdateSchema,
  VehicleParamsDTO,
  VehicleParamsSchema,
} from '@vehicles/schema';
import { FastifyInstance } from 'fastify';
import { z } from 'zod/v4';

import { authorizeAccessToken } from '@auth/services';
import { validateBody } from '@utils/validation';

import {
  createMaintenanceHandler,
  deleteMaintenanceHandler,
  getMaintenanceItemHandler,
  getMaintenanceListHandler,
  updateMaintenanceHandler,
} from './handlers';

export async function vehicleMaintenanceRoutes(
  app: FastifyInstance & { withTypeProvider: <_T>() => any },
) {
  app.get<{
    Params: VehicleParamsDTO;
    Querystring: VehicleMaintenanceFilterQuery;
    Reply: VehicleMaintenanceListResponseDTO;
  }>(
    '/:vehicleId/maintenance',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Vehicles Maintenance'],
        summary: 'List maintenance records',
        description:
          'Return maintenance and service records for a vehicle with optional ' +
          'section, date filtering, and pagination.',
        params: VehicleParamsSchema,
        querystring: VehicleMaintenanceFilterQuerySchema,
        response: {
          200: VehicleMaintenanceListResponseSchema,
        },
      },
    },
    getMaintenanceListHandler,
  );

  app.post<{
    Params: VehicleParamsDTO;
    Body: VehicleMaintenanceCreateDTO;
    Reply: VehicleMaintenanceResponseDTO;
  }>(
    '/:vehicleId/maintenance',
    {
      preHandler: [validateBody(VehicleMaintenanceCreateSchema), authorizeAccessToken()],
      schema: {
        tags: ['Vehicles Maintenance'],
        summary: 'Create maintenance record',
        description:
          'Create a new maintenance, service, or licensing expense ' +
          'record for a vehicle.',
        params: VehicleParamsSchema,
        body: VehicleMaintenanceCreateSchema,
        response: {
          201: VehicleMaintenanceResponseSchema,
        },
      },
    },
    createMaintenanceHandler,
  );

  app.get<{
    Params: VehicleMaintenanceParamsDTO;
    Reply: VehicleMaintenanceResponseDTO;
  }>(
    '/:vehicleId/maintenance/:recordId',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Vehicles Maintenance'],
        summary: 'Get single maintenance record',
        description: 'Return details of a single maintenance record.',
        params: VehicleMaintenanceParamsSchema,
        response: {
          200: VehicleMaintenanceResponseSchema,
        },
      },
    },
    getMaintenanceItemHandler,
  );

  app.patch<{
    Params: VehicleMaintenanceParamsDTO;
    Body: VehicleMaintenanceUpdateDTO;
    Reply: VehicleMaintenanceResponseDTO;
  }>(
    '/:vehicleId/maintenance/:recordId',
    {
      preHandler: [validateBody(VehicleMaintenanceUpdateSchema), authorizeAccessToken()],
      schema: {
        tags: ['Vehicles Maintenance'],
        summary: 'Update maintenance record',
        description: 'Update an existing maintenance record.',
        params: VehicleMaintenanceParamsSchema,
        body: VehicleMaintenanceUpdateSchema,
        response: {
          200: VehicleMaintenanceResponseSchema,
        },
      },
    },
    updateMaintenanceHandler,
  );

  app.delete<{
    Params: VehicleMaintenanceParamsDTO;
    Reply: void;
  }>(
    '/:vehicleId/maintenance/:recordId',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Vehicles Maintenance'],
        summary: 'Delete maintenance record',
        description: 'Delete a single maintenance record.',
        params: VehicleMaintenanceParamsSchema,
        response: {
          204: z.undefined(),
        },
      },
    },
    deleteMaintenanceHandler,
  );
}
