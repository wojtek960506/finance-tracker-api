import { FastifyReply, FastifyRequest } from 'fastify';

import { AccountDTO } from '@account/schema';
import { createAccount } from '@account/services';
import { AuthenticatedRequest } from '@shared/http';

export const createAccountHandler = async (
  req: FastifyRequest<{ Body: AccountDTO }>,
  res: FastifyReply,
) => {
  const ownerId = (req as AuthenticatedRequest).userId;
  const result = await createAccount(ownerId, req.body);
  return res.code(201).send(result);
};
