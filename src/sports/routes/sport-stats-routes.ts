import { FastifyInstance } from 'fastify';

import { authorizeAccessToken } from '@auth/services';

import {
  SportStatsQueryDTO,
  SportStatsQuerySchema,
  SportStatsResponseDTO,
  SportStatsResponseSchema,
} from '../schema';

import { getSportStatsHandler } from './handlers';

export async function sportStatsRoutes(
  app: FastifyInstance & { withTypeProvider: <_T>() => any },
) {
  app.get<{
    Querystring: SportStatsQueryDTO;
    Reply: SportStatsResponseDTO;
  }>(
    '/',
    {
      preHandler: authorizeAccessToken(),
      schema: {
        tags: ['Sport Stats'],
        description:
          'Return aggregate sport expenditure statistics with category breakdown, ' +
          'yearly trends, and monthly distribution.',
        querystring: SportStatsQuerySchema,
        response: {
          200: SportStatsResponseSchema,
        },
      },
    },
    getSportStatsHandler,
  );
}
