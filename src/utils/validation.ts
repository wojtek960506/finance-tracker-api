import z from "zod";
import { ValidationError } from "./errors";
import { FastifyReply, FastifyRequest } from "fastify";


export function validateBody<T extends z.ZodType>(schema: T) {
  return async (req: FastifyRequest, _reply: FastifyReply) => {
    const data = validateSchema(schema, req.body);
    (req as any).body = data;
  };
}

export function validateQuery<T extends z.ZodType>(schema: T) {
  return async (req: FastifyRequest, _reply: FastifyReply) => {
    const data = validateSchema(schema, req.query);
    (req as any).query = data;
  };
}

export function validateSchema<T extends z.ZodType>(schema: T, values: unknown) {
  const parsed = schema.safeParse(values);
    if (!parsed.success)
      throw new ValidationError(parsed.error.issues);
    return parsed.data;
}