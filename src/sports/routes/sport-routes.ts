import { FastifyInstance } from 'fastify';

import { sportCategoryRoutes } from './sport-category-routes';

export async function sportRoutes(
  app: FastifyInstance & { withTypeProvider: <_T>() => any },
) {
  app.register(sportCategoryRoutes, { prefix: '/categories' });
}
