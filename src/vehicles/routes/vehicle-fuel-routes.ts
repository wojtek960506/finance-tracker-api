import {
  VehicleFuelEntryCreateDTO,
  VehicleFuelEntryCreateSchema,
  VehicleFuelEntryListResponseDTO,
  VehicleFuelEntryListResponseSchema,
  VehicleFuelEntryParamsDTO,
  VehicleFuelEntryParamsSchema,
  VehicleFuelEntryResponseDTO,
  VehicleFuelEntryResponseSchema,
  VehicleFuelEntryUpdateDTO,
  VehicleFuelEntryUpdateSchema,
  VehicleFuelFilterQuery,
  VehicleFuelFilterQuerySchema,
  VehicleParamsDTO,
  VehicleParamsSchema,
} from '@vehicles/schema';
import { FastifyInstance } from 'fastify';
import { z } from 'zod/v4';

import { authorizeAccessToken } from '@auth/services';
import { validateBody } from '@utils/validation';

import {
  createFuelEntryHandler,
  deleteFuelEntryHandler,
  getFuelEntriesHandler,
  getFuelEntryHandler,
  updateFuelEntryHandler,
} from './handlers';

export async function vehicleFuelRoutes(
  app: FastifyInstance & { withTypeProvider: <_T>() => any },
) {
  app.get<{
    Params: VehicleParamsDTO;
    Querystring: VehicleFuelFilterQuery;
    Reply: VehicleFuelEntryListResponseDTO;
  }>(
    '/:vehicleId/fuel',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Vehicles Fuel'],
        summary: 'List fuel entries',
        description:
          'Return fuel entries for a vehicle with optional date/full-tank filtering ' +
          'and enriched calculation metrics.',
        params: VehicleParamsSchema,
        querystring: VehicleFuelFilterQuerySchema,
        response: {
          200: VehicleFuelEntryListResponseSchema,
        },
      },
    },
    getFuelEntriesHandler,
  );

  app.post<{
    Params: VehicleParamsDTO;
    Body: VehicleFuelEntryCreateDTO;
    Reply: VehicleFuelEntryResponseDTO;
  }>(
    '/:vehicleId/fuel',
    {
      preHandler: [validateBody(VehicleFuelEntryCreateSchema), authorizeAccessToken()],
      schema: {
        tags: ['Vehicles Fuel'],
        summary: 'Create fuel entry',
        description:
          'Create a new fuel log entry for a vehicle, enforcing chronological ' +
          'odometer sequence validation.',
        params: VehicleParamsSchema,
        body: VehicleFuelEntryCreateSchema,
        response: {
          201: VehicleFuelEntryResponseSchema,
        },
      },
    },
    createFuelEntryHandler,
  );

  app.get<{
    Params: VehicleFuelEntryParamsDTO;
    Reply: VehicleFuelEntryResponseDTO;
  }>(
    '/:vehicleId/fuel/:entryId',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Vehicles Fuel'],
        summary: 'Get single fuel entry',
        description: 'Return raw details of a single fuel log entry.',
        params: VehicleFuelEntryParamsSchema,
        response: {
          200: VehicleFuelEntryResponseSchema,
        },
      },
    },
    getFuelEntryHandler,
  );

  app.patch<{
    Params: VehicleFuelEntryParamsDTO;
    Body: VehicleFuelEntryUpdateDTO;
    Reply: VehicleFuelEntryResponseDTO;
  }>(
    '/:vehicleId/fuel/:entryId',
    {
      preHandler: [validateBody(VehicleFuelEntryUpdateSchema), authorizeAccessToken()],
      schema: {
        tags: ['Vehicles Fuel'],
        summary: 'Update fuel entry',
        description:
          'Update a fuel log entry (re-validating odometer chronological ' +
          'sequence if date or odometer reading changes).',
        params: VehicleFuelEntryParamsSchema,
        body: VehicleFuelEntryUpdateSchema,
        response: {
          200: VehicleFuelEntryResponseSchema,
        },
      },
    },
    updateFuelEntryHandler,
  );

  app.delete<{
    Params: VehicleFuelEntryParamsDTO;
    Reply: void;
  }>(
    '/:vehicleId/fuel/:entryId',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Vehicles Fuel'],
        summary: 'Delete fuel entry',
        description: 'Delete a single fuel log entry.',
        params: VehicleFuelEntryParamsSchema,
        response: {
          204: z.undefined(),
        },
      },
    },
    deleteFuelEntryHandler,
  );
}
