import {
  NetWorthIndependenceQuery,
  NetWorthIndependenceQuerySchema,
  NetWorthIndependenceResponseDTO,
  NetWorthIndependenceResponseSchema,
  NetWorthQuery,
  NetWorthQuerySchema,
  NetWorthResponseDTO,
  NetWorthResponseSchema,
} from '@net-worth/schema';
import { FastifyInstance } from 'fastify';

import { authorizeAccessToken } from '@auth/services';

import { getFinancialIndependenceHandler, getNetWorthHandler } from './handlers';

const netWorthDescription =
  'Return unified net worth combining liquid cash from bank accounts and investments valuation,' +
  'with optional base currency normalization and asset allocation breakdown.';

const independenceDescription =
  'Calculate financial independence horizons and liquid safety buffer in months ' +
  'based on net worth and historical average living expenses / passive non-work incomes.';

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
        description: netWorthDescription,
        querystring: NetWorthQuerySchema,
        response: {
          200: NetWorthResponseSchema,
        },
      },
    },
    getNetWorthHandler,
  );

  app.get<{
    Querystring: NetWorthIndependenceQuery;
    Reply: NetWorthIndependenceResponseDTO;
  }>(
    '/independence',
    {
      preHandler: [authorizeAccessToken()],
      schema: {
        tags: ['Net Worth'],
        summary: 'Calculate financial independence and liquid safety buffer',
        description: independenceDescription,
        querystring: NetWorthIndependenceQuerySchema,
        response: {
          200: NetWorthIndependenceResponseSchema,
        },
      },
    },
    getFinancialIndependenceHandler,
  );
}
