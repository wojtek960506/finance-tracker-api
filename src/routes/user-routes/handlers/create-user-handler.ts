import { createUser } from "@services/users";
import { UserCreateDTO } from "@schemas/user";
import { FastifyReply, FastifyRequest } from "fastify";


export async function createUserHandler(
  req: FastifyRequest<{ Body: UserCreateDTO }>,
  res: FastifyReply,
) {
  const result = await createUser(req.body);
  return res.code(201).send(result);
}
