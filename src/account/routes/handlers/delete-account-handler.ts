import { FastifyReply, FastifyRequest } from 'fastify';

import { deleteAccount } from '@account/services';
import { AuthenticatedRequest, ParamsJustId } from '@shared/http';

export const deleteAccountHandler = async (
  req: FastifyRequest<{ Params: ParamsJustId }>,
  res: FastifyReply,
) => {
  const accountId = req.params.id;
  const userId = (req as AuthenticatedRequest).userId;

  const result = await deleteAccount(accountId, userId);
  return res.code(200).send(result);
};
