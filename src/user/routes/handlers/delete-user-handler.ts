import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthenticatedRequest, ParamsJustId } from '@shared/http';
import { deleteUser } from '@user/services';

export const deleteUserHandler = async (
  req: FastifyRequest<{ Params: ParamsJustId }>,
  res: FastifyReply,
) => {
  const authenticatedId = (req as AuthenticatedRequest).userId;
  const result = await deleteUser(req.params.id, authenticatedId);
  return res.code(200).send(result);
};
