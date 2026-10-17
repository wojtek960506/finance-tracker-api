import { FastifyInstance } from 'fastify';
import { z } from 'zod/v4';

import { authorizeAccessToken } from '@auth/services';
import { validateBody } from '@utils/validation';

import {
  SportEntryCreateDTO,
  SportEntryCreateSchema,
  SportEntryFilterQueryDTO,
  SportEntryFilterQuerySchema,
  SportEntryListResponseDTO,
  SportEntryListResponseSchema,
  SportEntryParamsDTO,
  SportEntryParamsSchema,
  SportEntryResponseDTO,
  SportEntryResponseSchema,
  SportEntryUpdateDTO,
  SportEntryUpdateSchema,
} from '../schema';

import {
  createSportEntryHandler,
  deleteSportEntryHandler,
  getSportEntryHandler,
  listSportEntriesHandler,
  updateSportEntryHandler,
} from './handlers';

export async function sportEntryRoutes(
  app: FastifyInstance & { withTypeProvider: <_T>() => any },
) {
  app.get<{
    Querystring: SportEntryFilterQueryDTO;
    Reply: SportEntryListResponseDTO;
  }>(
    '/',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Sport Entries'],
        summary: 'List sport entries',
        description:
          'Return paginated sport expenditure entries with optional filtering ' +
          'by category, date range, search query, and sorting.',
        querystring: SportEntryFilterQuerySchema,

        response: {
          200: SportEntryListResponseSchema,
        },
      },
    },
    listSportEntriesHandler,
  );

  app.post<{
    Body: SportEntryCreateDTO;
    Reply: SportEntryResponseDTO;
  }>(
    '/',
    {
      preHandler: [validateBody(SportEntryCreateSchema), authorizeAccessToken()],
      schema: {
        tags: ['Sport Entries'],
        summary: 'Create sport entry',
        description: 'Create a new sport expenditure record.',
        body: SportEntryCreateSchema,
        response: {
          201: SportEntryResponseSchema,
        },
      },
    },
    createSportEntryHandler,
  );

  app.get<{
    Params: SportEntryParamsDTO;
    Reply: SportEntryResponseDTO;
  }>(
    '/:id',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Sport Entries'],
        summary: 'Get sport entry by id',
        description: 'Return a single sport entry record by its id.',
        params: SportEntryParamsSchema,
        response: {
          200: SportEntryResponseSchema,
        },
      },
    },
    getSportEntryHandler,
  );

  app.patch<{
    Params: SportEntryParamsDTO;
    Body: SportEntryUpdateDTO;
    Reply: SportEntryResponseDTO;
  }>(
    '/:id',
    {
      preHandler: [validateBody(SportEntryUpdateSchema), authorizeAccessToken()],
      schema: {
        tags: ['Sport Entries'],
        summary: 'Update sport entry',
        description: 'Partially update an existing sport expenditure record.',
        params: SportEntryParamsSchema,
        body: SportEntryUpdateSchema,
        response: {
          200: SportEntryResponseSchema,
        },
      },
    },
    updateSportEntryHandler,
  );

  app.delete<{
    Params: SportEntryParamsDTO;
    Reply: void;
  }>(
    '/:id',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Sport Entries'],
        summary: 'Delete sport entry',
        description: 'Delete a single sport entry record.',
        params: SportEntryParamsSchema,
        response: {
          204: z.undefined(),
        },
      },
    },
    deleteSportEntryHandler,
  );
}
