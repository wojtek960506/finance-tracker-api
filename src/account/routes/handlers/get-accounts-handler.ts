import { FastifyReply, FastifyRequest } from 'fastify';

import { AccountsResponseDTO } from '@account/schema';
import { AuthenticatedRequest } from '@shared/http';
import { listNamedResources } from '@shared/named-resource/services';

export const getAccountsHandler = async (req: FastifyRequest, res: FastifyReply) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result = await listNamedResources<AccountsResponseDTO[number]>('account', userId);
  return res.code(200).send(result);
};
