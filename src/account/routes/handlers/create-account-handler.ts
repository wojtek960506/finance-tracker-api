import { FastifyReply, FastifyRequest } from 'fastify';

import { AccountDTO } from '@account/schema';
import { AuthenticatedRequest } from '@shared/http';
import { createNamedResource } from '@shared/named-resource/services';

export const createAccountHandler = async (
  req: FastifyRequest<{ Body: AccountDTO }>,
  res: FastifyReply,
) => {
  const ownerId = (req as AuthenticatedRequest).userId;
  const result = await createNamedResource<AccountDTO>('account', ownerId, req.body);
  return res.code(201).send(result);
};
