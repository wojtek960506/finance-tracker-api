import { FastifyReply, FastifyRequest } from 'fastify';

import { findAccounts } from '@account/db';
import { serializeAccount } from '@account/serializers';
import { AuthenticatedRequest } from '@shared/http';

export const getAccountsHandler = async (req: FastifyRequest, res: FastifyReply) => {
  const userId = (req as AuthenticatedRequest).userId;
  const result = await findAccounts(userId);
  return res.code(200).send(result.map((account) => serializeAccount(account)));
};
