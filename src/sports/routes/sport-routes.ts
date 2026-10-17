import { FastifyInstance } from 'fastify';

import { sportCategoryRoutes } from './sport-category-routes';
import { sportEntryRoutes } from './sport-entry-routes';

export async function sportRoutes(
  app: FastifyInstance & { withTypeProvider: <_T>() => any },
) {
  app.register(sportCategoryRoutes, { prefix: '/categories' });
  app.register(sportEntryRoutes);
}
