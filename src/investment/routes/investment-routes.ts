import { FastifyInstance } from 'fastify';

import { instrumentsRoutes } from './instruments-routes';
import { operationsRoutes } from './operations-routes';
import { summaryRoutes } from './summary-routes';

export async function investmentRoutes(app: FastifyInstance) {
  app.register(instrumentsRoutes, { prefix: '/instruments' });
  app.register(operationsRoutes, { prefix: '/operations' });
  app.register(summaryRoutes, { prefix: '/summary' });
}
