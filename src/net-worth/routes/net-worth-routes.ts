import {
  NetWorthQuery,
  NetWorthQuerySchema,
  NetWorthResponseDTO,
  NetWorthResponseSchema,
} from '@net-worth/schema';
import { FastifyInstance } from 'fastify';

import { authorizeAccessToken } from '@auth/services';

import { getNetWorthHandler } from './handlers';

const description =
  'Return unified net worth combining liquid cash from bank accounts and investments valuation,' +
  'with optional base currency normalization and asset allocation breakdown.';

export async function netWorthRoutes(app: FastifyInstance) {
  app.get<{
    Querystring: NetWorthQuery;
    Reply: NetWorthResponseDTO;
  }>(
    '/',
    {
      preHandler: [authorizeAccessToken()],
      schema: {
        tags: ['Net Worth'],
        summary: 'Get unified net worth and asset allocation',
        description,
        querystring: NetWorthQuerySchema,
        response: {
          200: NetWorthResponseSchema,
        },
      },
    },
    getNetWorthHandler,
  );
}
