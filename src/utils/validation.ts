import { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import { ValidationError } from "./errors";

export function validateBody<T extends z.ZodTypeAny>(schema: T) {
  return async (req: FastifyRequest, _reply: FastifyReply) => {
    const parsed = schema.safeParse(req.body)
    if (!parsed.success)
      throw new ValidationError(parsed.error.issues);

    (req as any).body = parsed.data
  };
}