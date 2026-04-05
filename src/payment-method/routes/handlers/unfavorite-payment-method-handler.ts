import { FastifyReply, FastifyRequest } from 'fastify';

import { AuthenticatedRequest, ParamsJustId } from '@shared/http';
import { unfavoriteNamedResource } from '@shared/named-resource/services';

export const unfavoritePaymentMethodHandler = async (
  req: FastifyRequest<{ Params: ParamsJustId }>,
  res: FastifyReply,
) => {
  const paymentMethodId = req.params.id;
  const userId = (req as AuthenticatedRequest).userId;
  const result = await unfavoriteNamedResource('paymentMethod', paymentMethodId, userId);
  return res.code(200).send(result);
};
