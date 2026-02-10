import { createTestUser } from "@services/users";
import { TestUserCreateDTO } from "@schemas/user";
import { FastifyReply, FastifyRequest } from "fastify";


export const createTestUserHandler = async (
  req: FastifyRequest<{ Body: TestUserCreateDTO }>,
  res: FastifyReply,
) => {
  const result = await createTestUser(req.body);
  return res.code(201).send(result);
}
