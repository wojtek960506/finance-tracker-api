import { FastifyReply, FastifyRequest } from 'fastify';

import { UserCreateDTO } from '@user/schema';
import { createUser } from '@user/services';

export async function createUserHandler(
  req: FastifyRequest<{ Body: UserCreateDTO }>,
  res: FastifyReply,
) {
  const result = await createUser(req.body);
  return res.code(201).send(result);
}
