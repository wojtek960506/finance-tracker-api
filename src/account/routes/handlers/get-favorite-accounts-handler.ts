import { FastifyReply, FastifyRequest } from 'fastify';

import { getFavoriteAccounts } from '@account/services';
import { AuthenticatedRequest } from '@shared/http';

export const getFavoriteAccountsHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result = await getFavoriteAccounts(userId);
  return res.code(200).send(result);
};
