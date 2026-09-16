import { FastifyInstance } from 'fastify';

import { instrumentsRoutes } from './instruments-routes';
import { operationsRoutes } from './operations-routes';

export async function investmentRoutes(app: FastifyInstance) {
  app.register(instrumentsRoutes, { prefix: '/instruments' });
  app.register(operationsRoutes, { prefix: '/operations' });
}
