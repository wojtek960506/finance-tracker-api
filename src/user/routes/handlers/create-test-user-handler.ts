import { createTestUser } from "@user/services";
import { TestUserCreateDTO } from "@user/schema";
import { FastifyReply, FastifyRequest } from "fastify";


export const createTestUserHandler = async (
  req: FastifyRequest<{ Body: TestUserCreateDTO }>,
  res: FastifyReply,
) => {
  const result = await createTestUser(req.body);
  return res.code(201).send(result);
}
