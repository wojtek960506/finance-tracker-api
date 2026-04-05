import { FastifyReply, FastifyRequest } from 'fastify';

import { AccountResponseDTO } from '@account/schema';
import { AuthenticatedRequest, ParamsJustId } from '@shared/http';
import { favoriteNamedResource } from '@shared/named-resource/services';

export const favoriteAccountHandler = async (
  req: FastifyRequest<{ Params: ParamsJustId }>,
  res: FastifyReply,
) => {
  const accountId = req.params.id;
  const userId = (req as AuthenticatedRequest).userId;
  const result = await favoriteNamedResource<AccountResponseDTO>(
    'account',
    accountId,
    userId,
  );
  return res.code(200).send(result);
};
