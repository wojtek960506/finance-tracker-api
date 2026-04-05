import { FastifyReply, FastifyRequest } from 'fastify';

import { favoritePaymentMethod } from '@payment-method/services';
import { AuthenticatedRequest, ParamsJustId } from '@shared/http';

export const favoritePaymentMethodHandler = async (
  req: FastifyRequest<{ Params: ParamsJustId }>,
  res: FastifyReply,
) => {
  const paymentMethodId = req.params.id;
  const userId = (req as AuthenticatedRequest).userId;
  const result = await favoritePaymentMethod(paymentMethodId, userId);
  return res.code(200).send(result);
};
