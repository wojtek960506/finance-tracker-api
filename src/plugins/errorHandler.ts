import { ZodError } from "zod";
import { AppError } from "@utils/errors";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";


export async function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler(
    (error: unknown, _req: FastifyRequest, res: FastifyReply) => {
      // Known (custom) errors
      if (error instanceof AppError) {
        return res.status(error.statusCode).send({
          message: error.message,
          details: error.details
        })
      }

      // Zod validation errors - will be handled here if:
      // `const app = Fastify({ logger: true }).withTypeProvider<ZodTypeProvider>();`
      // `npm i fastify-type-provider-zod`
      // from Fastify or manual safeParse
      if (error instanceof ZodError) {
        return res.status(400).send({
          message: "Validation error",
          details: error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        });
      }

      // Fallback: unknown error
      app.log.error(error);
      return res.status(500).send({ 
        message: "Internal server error",
        details: error
      });
    }
  )
}