import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthenticatedRequest } from '@shared/http';
import { emptyTrash } from '@transaction/services';

export const emptyTrashHandler = async (req: FastifyRequest, res: FastifyReply) => {
  const ownerId = (req as AuthenticatedRequest).userId;
  const result = await emptyTrash(ownerId);
  return res.code(200).send(result);
};
