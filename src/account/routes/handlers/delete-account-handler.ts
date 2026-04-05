import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthenticatedRequest, ParamsJustId } from '@shared/http';
import { deleteNamedResource } from '@shared/named-resource/services';

export const deleteAccountHandler = async (
  req: FastifyRequest<{ Params: ParamsJustId }>,
  res: FastifyReply,
) => {
  const accountId = req.params.id;
  const userId = (req as AuthenticatedRequest).userId;

  const result = await deleteNamedResource('account', accountId, userId);
  return res.code(200).send(result);
};
