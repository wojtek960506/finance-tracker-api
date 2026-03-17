import { FastifyInstance } from 'fastify';
import { z } from 'zod/v4';

import { WELCOME_MESSAGE } from './consts';

const WelcomeResponseSchema = z.object({
  message: z.string(),
});

z.globalRegistry.add(WelcomeResponseSchema, { id: 'WelcomeResponse' });

export async function mainRoutes(app: FastifyInstance) {
  app.get(
    '/',
    {
      schema: {
        tags: ['Main'],
        summary: 'Welcome message',
        description: 'Return a friendly welcome message.',
        security: [],
        response: {
          200: WelcomeResponseSchema,
        },
      },
    },
    async (_req, res) => {
      return res.code(200).send({ message: WELCOME_MESSAGE });
    },
  );
}
