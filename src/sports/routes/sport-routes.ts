import { FastifyInstance } from 'fastify';

import { sportCategoryRoutes } from './sport-category-routes';
import { sportEntryRoutes } from './sport-entry-routes';
import { sportSpendingRoutes } from './sport-spending-routes';
import { sportStatsRoutes } from './sport-stats-routes';

export async function sportRoutes(
  app: FastifyInstance & { withTypeProvider: <_T>() => any },
) {
  app.register(sportCategoryRoutes, { prefix: '/categories' });
  app.register(sportStatsRoutes, { prefix: '/stats' });
  app.register(sportSpendingRoutes);
  app.register(sportEntryRoutes);
}
