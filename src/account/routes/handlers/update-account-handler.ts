import { FastifyReply, FastifyRequest } from 'fastify';

import { AccountDTO } from '@account/schema';
import { AuthenticatedRequest, ParamsJustId } from '@shared/http';
import { updateNamedResource } from '@shared/named-resource/services';

export const updateAccountHandler = async (
  req: FastifyRequest<{ Params: ParamsJustId; Body: AccountDTO }>,
  res: FastifyReply,
) => {
  const accountId = req.params.id;
  const userId = (req as AuthenticatedRequest).userId;
  const dto = req.body;

  const result = await updateNamedResource<AccountDTO>('account', accountId, userId, dto);
  return res.code(200).send(result);
};
