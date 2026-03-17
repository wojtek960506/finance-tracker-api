import { FastifyReply, FastifyRequest } from 'fastify';

import { AccountDTO } from '@account/schema';
import { updateAccount } from '@account/services';
import { AuthenticatedRequest, ParamsJustId } from '@shared/http';

export const updateAccountHandler = async (
  req: FastifyRequest<{ Params: ParamsJustId; Body: AccountDTO }>,
  res: FastifyReply,
) => {
  const accountId = req.params.id;
  const userId = (req as AuthenticatedRequest).userId;
  const dto = req.body;

  const result = await updateAccount(accountId, userId, dto);
  return res.code(200).send(result);
};
