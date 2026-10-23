import {
  DashboardSummaryQuery,
  DashboardSummaryQuerySchema,
  DashboardSummaryResponseDTO,
  DashboardSummaryResponseSchema,
} from '@dashboard/schema';
import { FastifyInstance } from 'fastify';

import { authorizeAccessToken } from '@auth/services';

import { getDashboardSummaryHandler } from './handlers';

const dashboardDescription =
  'Returns aggregated metrics for transactions, investments, vehicles, sports, ' +
  'and the latest transactions.';

export async function dashboardRoutes(app: FastifyInstance) {
  app.get<{
    Querystring: DashboardSummaryQuery;
    Reply: DashboardSummaryResponseDTO;
  }>(
    '/summary',
    {
      preHandler: [authorizeAccessToken()],
      schema: {
        tags: ['Dashboard'],
        summary: 'Get consolidated home dashboard summary',
        description: dashboardDescription,
        operationId: 'get_dashboard_summary',
        querystring: DashboardSummaryQuerySchema,
        response: {
          200: DashboardSummaryResponseSchema,
        },
      },
    },
    getDashboardSummaryHandler,
  );
}
