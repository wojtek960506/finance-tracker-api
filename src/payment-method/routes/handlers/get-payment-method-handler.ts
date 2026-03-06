import { FastifyReply, FastifyRequest } from 'fastify';

import { getPaymentMethod } from '@payment-method/services';
import { AuthenticatedRequest, ParamsJustId } from '@shared/http';

export const getPaymentMethodHandler = async (
  req: FastifyRequest<{ Params: ParamsJustId }>,
  res: FastifyReply,
) => {
  const paymentMethodId = req.params.id;
  const userId = (req as AuthenticatedRequest).userId;
  const result = await getPaymentMethod(paymentMethodId, userId);
  return res.code(200).send(result);
};
