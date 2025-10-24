import { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";

export function validateBody<T extends z.ZodTypeAny>(schema: T) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const parsed = schema.safeParse(req.body)
    if (!parsed.success) {
      return reply.code(400).send({
        message: "Validation error",
        errors: parsed.error.issues
      });
    }

    (req as any).body = parsed.data
  };
}