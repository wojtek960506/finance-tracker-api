import {
  InvestmentSummaryResponseDTO,
  InvestmentSummaryResponseSchema,
} from '@investment/schema';
import { FastifyInstance } from 'fastify';

import { authorizeAccessToken } from '@auth/services';

import { getInvestmentSummaryHandler } from './handlers';

const description =
  'Return aggregated portfolio valuation, performance totals by currency,' +
  'and per-instrument summary metrics.';

export async function summaryRoutes(app: FastifyInstance) {
  app.get<{
    Reply: InvestmentSummaryResponseDTO;
  }>(
    '/',
    {
      preHandler: [authorizeAccessToken()],
      schema: {
        tags: ['Investments'],
        summary: 'Get investment portfolio summary',
        description,
        response: {
          200: InvestmentSummaryResponseSchema,
        },
      },
    },
    getInvestmentSummaryHandler,
  );
}
