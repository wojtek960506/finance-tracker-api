import { FastifyReply, FastifyRequest } from 'fastify';

import { unfavoritePaymentMethod } from '@payment-method/services';
import { AuthenticatedRequest, ParamsJustId } from '@shared/http';

export const unfavoritePaymentMethodHandler = async (
  req: FastifyRequest<{ Params: ParamsJustId }>,
  res: FastifyReply,
) => {
  const paymentMethodId = req.params.id;
  const userId = (req as AuthenticatedRequest).userId;
  const result = await unfavoritePaymentMethod(paymentMethodId, userId);
  return res.code(200).send(result);
};
