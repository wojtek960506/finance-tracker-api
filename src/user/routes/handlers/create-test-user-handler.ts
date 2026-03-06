import { FastifyReply, FastifyRequest } from 'fastify';

import { TestUserCreateDTO } from '@user/schema';
import { createTestUser } from '@user/services';

export const createTestUserHandler = async (
  req: FastifyRequest<{ Body: TestUserCreateDTO }>,
  res: FastifyReply,
) => {
  const result = await createTestUser(req.body);
  return res.code(201).send(result);
};
