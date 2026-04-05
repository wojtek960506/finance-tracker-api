import { FastifyReply, FastifyRequest } from 'fastify';

import { AccountResponseDTO } from '@account/schema';
import { AuthenticatedRequest } from '@shared/http';
import { getFavoriteNamedResources } from '@shared/named-resource/services';

export const getFavoriteAccountsHandler = async (
  req: FastifyRequest,
  res: FastifyReply,
) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result = await getFavoriteNamedResources<AccountResponseDTO>('account', userId);
  return res.code(200).send(result);
};
