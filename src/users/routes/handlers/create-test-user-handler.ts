import { createTestUser } from "@users/services";
import { TestUserCreateDTO } from "@users/schema";
import { FastifyReply, FastifyRequest } from "fastify";


export const createTestUserHandler = async (
  req: FastifyRequest<{ Body: TestUserCreateDTO }>,
  res: FastifyReply,
) => {
  const result = await createTestUser(req.body);
  return res.code(201).send(result);
}
