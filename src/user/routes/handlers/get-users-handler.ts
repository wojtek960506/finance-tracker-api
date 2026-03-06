import { FastifyReply, FastifyRequest } from 'fastify';

import { getUsers } from '@user/services';

export const getUsersHandler = async (_req: FastifyRequest, res: FastifyReply) => {
  const result = await getUsers();
  return res.code(200).send(result);
};
