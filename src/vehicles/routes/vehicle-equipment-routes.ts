import {
  VehicleEquipmentCreateDTO,
  VehicleEquipmentCreateSchema,
  VehicleEquipmentFilterQuery,
  VehicleEquipmentFilterQuerySchema,
  VehicleEquipmentListResponseDTO,
  VehicleEquipmentListResponseSchema,
  VehicleEquipmentParamsDTO,
  VehicleEquipmentParamsSchema,
  VehicleEquipmentResponseDTO,
  VehicleEquipmentResponseSchema,
  VehicleEquipmentUpdateDTO,
  VehicleEquipmentUpdateSchema,
  VehicleParamsDTO,
  VehicleParamsSchema,
} from '@vehicles/schema';
import { FastifyInstance } from 'fastify';
import { z } from 'zod/v4';

import { authorizeAccessToken } from '@auth/services';
import { validateBody } from '@utils/validation';

import {
  createEquipmentHandler,
  deleteEquipmentHandler,
  getEquipmentItemHandler,
  getEquipmentListHandler,
  updateEquipmentHandler,
} from './handlers';

export async function vehicleEquipmentRoutes(
  app: FastifyInstance & { withTypeProvider: <_T>() => any },
) {
  app.get<{
    Params: VehicleParamsDTO;
    Querystring: VehicleEquipmentFilterQuery;
    Reply: VehicleEquipmentListResponseDTO;
  }>(
    '/:vehicleId/equipment',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Vehicles Equipment'],
        summary: 'List equipment items',
        description:
          'Return equipment items for a vehicle with optional date ' +
          'filtering and pagination.',
        params: VehicleParamsSchema,
        querystring: VehicleEquipmentFilterQuerySchema,
        response: {
          200: VehicleEquipmentListResponseSchema,
        },
      },
    },
    getEquipmentListHandler,
  );

  app.post<{
    Params: VehicleParamsDTO;
    Body: VehicleEquipmentCreateDTO;
    Reply: VehicleEquipmentResponseDTO;
  }>(
    '/:vehicleId/equipment',
    {
      preHandler: [validateBody(VehicleEquipmentCreateSchema), authorizeAccessToken()],
      schema: {
        tags: ['Vehicles Equipment'],
        summary: 'Create equipment item',
        description: 'Create a new equipment/accessory purchase record for a vehicle.',
        params: VehicleParamsSchema,
        body: VehicleEquipmentCreateSchema,
        response: {
          201: VehicleEquipmentResponseSchema,
        },
      },
    },
    createEquipmentHandler,
  );

  app.get<{
    Params: VehicleEquipmentParamsDTO;
    Reply: VehicleEquipmentResponseDTO;
  }>(
    '/:vehicleId/equipment/:itemId',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Vehicles Equipment'],
        summary: 'Get single equipment item',
        description: 'Return details of a single equipment item.',
        params: VehicleEquipmentParamsSchema,
        response: {
          200: VehicleEquipmentResponseSchema,
        },
      },
    },
    getEquipmentItemHandler,
  );

  app.patch<{
    Params: VehicleEquipmentParamsDTO;
    Body: VehicleEquipmentUpdateDTO;
    Reply: VehicleEquipmentResponseDTO;
  }>(
    '/:vehicleId/equipment/:itemId',
    {
      preHandler: [validateBody(VehicleEquipmentUpdateSchema), authorizeAccessToken()],
      schema: {
        tags: ['Vehicles Equipment'],
        summary: 'Update equipment item',
        description: 'Update an existing equipment item.',
        params: VehicleEquipmentParamsSchema,
        body: VehicleEquipmentUpdateSchema,
        response: {
          200: VehicleEquipmentResponseSchema,
        },
      },
    },
    updateEquipmentHandler,
  );

  app.delete<{
    Params: VehicleEquipmentParamsDTO;
    Reply: void;
  }>(
    '/:vehicleId/equipment/:itemId',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Vehicles Equipment'],
        summary: 'Delete equipment item',
        description: 'Delete a single equipment item.',
        params: VehicleEquipmentParamsSchema,
        response: {
          204: z.undefined(),
        },
      },
    },
    deleteEquipmentHandler,
  );
}
