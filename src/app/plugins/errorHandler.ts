import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';

import { AppError } from '@utils/errors';

export async function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error: unknown, _req: FastifyRequest, res: FastifyReply) => {
    // Known (custom) errors
    if (error instanceof AppError) {
      return res.status(error.statusCode).send({
        code: error.code,
        message: error.message,
        details: error.details,
      });
    }

    // Zod validation errors - will be handled here if:
    // `const app = Fastify({ logger: true }).withTypeProvider<ZodTypeProvider>();`
    // `npm i fastify-type-provider-zod`
    // from Fastify or manual safeParse
    if (error instanceof ZodError) {
      return res.status(400).send({
        code: 'VALIDATION_ERROR',
        message: 'Validation error',
        details: error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    // Fallback: unknown error
    app.log.error(error);
    return res.status(500).send({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error',
      details: null,
    });
  });
}
