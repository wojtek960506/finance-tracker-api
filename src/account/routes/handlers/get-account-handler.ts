import { FastifyReply, FastifyRequest } from 'fastify';

import { getAccount } from '@account/services';
import { AuthenticatedRequest, ParamsJustId } from '@shared/http';

export const getAccountHandler = async (
  req: FastifyRequest<{ Params: ParamsJustId }>,
  res: FastifyReply,
) => {
  const accountId = req.params.id;
  const userId = (req as AuthenticatedRequest).userId;
  const result = await getAccount(accountId, userId);
  return res.code(200).send(result);
};
